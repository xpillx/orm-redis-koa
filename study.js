function doubleAfter2seconds(num) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(2 * num)
        }, 2000);
    } )
}
doubleAfter2seconds(10).then(result=>{
    console.log(result);
})

async function test(num){
    let n=await doubleAfter2seconds(num);
    console.log('in '+n);
    return n;
}

