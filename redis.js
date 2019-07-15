var Redis = require('ioredis');
var redis = new Redis({
    port: 6379,          // Redis port
    host: '127.0.0.1',   // Redis host
    family: 4,           // 4 (IPv4) or 6 (IPv6)
    db: 10
  });

 function set(key,value){
     return new Promise((resolve,reject)=>{
        redis.set(key, value,function(err,result){
            if(err){
                console.log(err);
                reject(err);
            }
            // console.log('in1 '+result);
            resolve(result);
        });
     })
    
}
function get(key){
    return new Promise((resolve,reject)=>{
        redis.get(key,function(err,result){
            if(err){
                console.log(err);
                reject(err);
            }
            // console.log("in "+result);
            resolve(result);
        });
     })

}


function setLock(key,value,expire){
    return new Promise((resolve,reject)=>{
       redis.set(key, value,'NX','PX',expire,function(err,result){
          if(result){
            console.log(`获取到锁 ${new Date().getTime()} ${process.pid}`);
            resolve(true);
          }else{
            // console.log('获取失败');
            resolve(false);
          }
       });
    })
}

function del(key){
    return new Promise((resolve,reject)=>{
       redis.del(key);
       resolve(true);
    })
}
// (async ()=>{
//     let boo=await set('A:lock','test',70000);
//     console.log(boo);
// })();

// (async ()=>{
//     let boo=await set('A:lock','test',70000);
//     console.log(boo);
// })();


module.exports.set=set;
module.exports.setLock=setLock;
module.exports.get=get;
module.exports.del=del;