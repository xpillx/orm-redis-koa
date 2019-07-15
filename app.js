const Koa=require('koa');
const router=require('koa-router')();
const bodyparser=require('koa-bodyparser'); 
const templating=require('./templating');
const redis=require('./redis');

const app=new Koa();

app.use(bodyparser());
const isProduction = process.env.NODE_ENV === 'production';
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

const Sequelize = require('sequelize');
const config = require('./config');
var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    },
    timezone: '+08:00' //东八时区
});

var User=sequelize.define('usernames',{
    firstName:{
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    }
    }, {
    freezeTableName: true,//自定义名称
    timestamps: true 
});

app.use(async (ctx,next)=>{
    if(ctx.request.path=='/favicon.ico'){
        return;
    }

    var start=Date.now();
    await next();
    var end=Date.now()-start;
    // console.log(`process ${ctx.request.method} ${ctx.request.path} ${end} ${process.pid}`);
});

router.get('/',async (ctx,next)=>{
   ctx.render('hello.html',{title:'主页'});
})

function sleep(milliSeconds){ 
    var StartTime =new Date().getTime(); 
    let i = 0;
    while (new Date().getTime() <StartTime+milliSeconds);

}

router.get('/usernames',async (ctx,next)=>{
    sleep(5000);
    const data=await User.findAll();
    ctx.render('userinfo.html',{title:'信息',userinfo:data});
})

router.post('/search',async (ctx,next)=>{
    var arr=ctx.request.body.ids.split(",");
    const data=await User.findAll({
        where:{
              id:arr,
        }
    });
    ctx.render('userinfo.html',{title:'信息',userinfo:data});
})

router.post('/add',async (ctx,next)=>{
    const data=await User.create({
        firstName: ctx.request.body.firstName,
        lastName: ctx.request.body.lastName
    });
    ctx.render('userinfo.html',{title:'信息',userinfo:[data]});
})

router.post('/update',async (ctx,next)=>{
    const result=await User.update(
        {firstName:ctx.request.body.firstName,lastName:ctx.request.body.lastName},
        {'where':{id:ctx.request.body.id}});
    
    ctx.render('result.html',{title:'信息',modify:'更新',result:result});
})

router.post('/del',async (ctx,next)=>{
    let result=await User.destroy({
        where:{id:ctx.request.body.id}}
    );
    console.log(`${result}`);
    ctx.render('result.html',{title:'信息',modify:'删除',result:result});
})

router.get('/redisset/:key/:value',async (ctx,next)=>{
    var key = ctx.params.key;
    var value = ctx.params.value;
    let result=await redis.set(`A:${key}`,`${value}`);
    console.log(`${result}`);
    ctx.response.body = `<h1>Hello, ${key} ${value}!</h1>`;
})

router.get('/redisget/:key',async (ctx,next)=>{
    var key = ctx.params.key;
    let result=await redis.get(`A:${key}`);
    if(result>0){
        let bo=await redis.setLock('A:lock',0,5000);
        if(bo){
            let result=await redis.get(`A:${key}`);
            if(result>0){
                result--;
                let res=await redis.set(`A:${key}`,`${result}`);
                console.log(res);
                let value=await redis.get(`A:${key}`);
                console.log(value);
                if(res=='OK'){
                    redis.del('A:lock');
                    console.log(`lock ${new Date().getTime()} ${process.pid} ${result}`);
                    ctx.response.body = `<h1>res, ${key} ${result}!</h1>`;
                }
            }
        }else{
            ctx.response.body = `<h1>res, 获取锁失败 ${bo}!</h1>`;
        }
    }else{
        ctx.response.body = `<h1>秒杀结束...</h1>`;
    }
})

app.use(router.routes());

app.listen(5000);
console.log('app listen 5000...');