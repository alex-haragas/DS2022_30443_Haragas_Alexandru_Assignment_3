const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "chat.proto";
const SERVER_URI = "0.0.0.0:9099";

const usersInChat = [];
const observers = [];

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// we'll implement the handlers here
const join = (call, callback) => {
  const user = call.request;

  // check username already exists.
  const userExiist = usersInChat.find((_user) => _user.name == user.name);
  if (!userExiist) {
    usersInChat.push(user);
    callback(null, {
      error: 0,
      msg: "Success",
    });
  } else {
    callback(null, { error: 1, msg: "user already exist." });
  }
};

const sendMsg = (call, callback) => {
  const chatObj = call.request;
  console.log("Got Message\n");
  observers.forEach((observer) => {
    observer.call.write(chatObj);
  });
  let obj = usersInChat.findIndex(o => o.name === chatObj.to)
  if(obj!=-1){
    console.log("found")
    callback(null, { error: 0,msg: "found" });
  }
  else{
    console.log("not found")

    callback(null,  { error: 0,msg: "not found" });
  }
};

const getAllUsers = (call, callback) => {
  callback(null, { users: usersInChat });
};

const receiveMsg = (call, callback) => {
  console.log("Got Message\n");
  observers.push({
    call,
  });
};

const server = new grpc.Server();

server.addService(protoDescriptor.ChatService.service, {
  join,
  sendMsg,
  getAllUsers,
  receiveMsg,
});

server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure());

server.start();
console.log("Server is running!");