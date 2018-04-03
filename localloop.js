function localPeerConnectionLoop(cfg) {
  const setD = (d, a, b) => Promise.all([a.setLocalDescription(d), b.setRemoteDescription(d)]);
  return [0, 1].map(() => new RTCPeerConnection(cfg)).map((pc, i, pcs) => Object.assign(pc, {
    onicecandidate: e => pcs[i ^ 1].addIceCandidate(e.candidate),
    onnegotiationneeded: async e => {
      try {
        await setD(await pc.createOffer(), pc, pcs[i ^ 1]);
        await setD(await pcs[i ^ 1].createAnswer(), pcs[i ^ 1], pc);
      } catch (e) {
        console.error(e);
      }
    }
  }));
}

function whiteNoise() {
  let canvas = Object.assign(document.createElement("canvas"), {width: 320, height: 240});
  let ctx = canvas.getContext('2d');
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let p = ctx.getImageData(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(function draw(){
    for (var i = 0; i < p.data.length; i++) {
      p.data[i++] = p.data[i++] = p.data[i++] = Math.random() * 255;
    }
    ctx.putImageData(p, 0, 0);
    requestAnimationFrame(draw);
  });
  return canvas.captureStream(60);
}
