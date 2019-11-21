var index1 = new require('./index');
var index2 = new require('./index');

port = [5001,5002,5003,5004,5005];

for(let i=0;i<5;i++){
    var index = new require('./index');
    index(port[i]);
}
// index1(5012);
// index2(5013);


