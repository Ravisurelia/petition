(function () {
  //combination of stickman and panes.....
  let canvas = document.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  console.log("ctx:", ctx);
  let sign = document.getElementById("sign");

  let sketch;

  ctx.lineWidth = 2;
  ctx.strokeStyle = "black";

  canvas.addEventListener("mousedown", (event) => {
    console.log("my event: ", event);
    let x = event.offsetX;
    let y = event.offsetY;
    sketch = true;
    ctx.moveTo(x, y);
  });
  canvas.addEventListener("mousemove", (event) => {
    if (!sketch) {
      return;
    } else {
      ctx.moveTo(x, y);
      let x = event.offsetX;
      let y = event.offsetY;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });
  canvas.addEventListener("mouseout", (event) => {
    sketch = false;
    console.log("mouseout!!!!!");
  });
  canvas.addEventListener("mouseup", (event) => {
    sketch = false;
    sign.value = canvas.toDataURL();
    console.log("my data url: ", sign.value);
  });
})();
