const socket = io("/");
const videoGrid = document.getElementById("video-grid");

const videoButton = document.getElementById("videobtn");

let videostatus = true;

const myPeer = new Peer(undefined, {
  host: "45.76.102.185",
  port: "3020",
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      // the frist peer (server OWN PERR)
      call.answer(stream); //g-> strem
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        // r -> stream
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    //recive his stream
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    //stream closed
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

videoButton.addEventListener("click", () => {
  videoButton.innerText = OnVideo(myVideo) ? "video:OFF" : "Video:ON";
});

function OnVideo(streamvideo) {
  videostatus = !videostatus;
  streamvideo.srcObject.getTracks().forEach((t) => (t.enabled = videostatus));
  return videostatus;
}
