var canvas
var canvas2
var ctx
var ctx2;
var video;
var webcamWidth;
var webcamHeight;

var start;
var end;


//var js_wrapped_fib = Module.cwrap("fib", "number", ["number"]);

navigator.getUserMedia = (
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);

function startWebcam() {
   canvas = document.getElementById("myCanvas")
   canvas2 = document.getElementById("myCanvas2")
   video = document.getElementById('video')
  
  ctx = canvas.getContext('2d')
  const mediaSource = new MediaSource();

  if (navigator.getUserMedia) {
    navigator.getUserMedia (
      {
        video: true,
        audio: false
      },

      function(stream) {
        webcamWidth = stream.getVideoTracks()[0].getSettings().width
        webcamHeight = stream.getVideoTracks()[0].getSettings().height
        canvas.setAttribute('width', webcamWidth);
        canvas.setAttribute('height', webcamHeight);
        canvas2.setAttribute('width', 300);
        canvas2.setAttribute('height', 300);

        // video.src = window.URL.createObjectURL(localMediaStream);
        video.srcObject = stream
        video = document.getElementById('video');

        if (navigator.mediaDevices.getUserMedia) {
            
            video.srcObject = stream;
          } else {
            var vendorURL = window.URL || window.webkitURL;
            video.src = vendorURL.createObjectURL(stream);
          }
          video.play();
      },

      function(err) {
        console.log( err);
      }
    );
  } else {
  console.log("getUserMedia not supported by your browser");
  }
}

function takepicture() {
    ctx.drawImage(video, 0, 0);
    const img_dataURI = canvas.toDataURL('image/png');
    document.getElementById("myCanvas").src = img_dataURI


    const myPicture = ctx.getImageData(
      0,
      0,
      webcamWidth,
      webcamHeight
    );
    console.log(myPicture);


    start = new Date();
    const buffer = Module._malloc(myPicture.data.length);
    Module.HEAPU8.set(myPicture.data, buffer);
    
    
    const test = Module._process(buffer, webcamWidth, webcamHeight);
    
    end = new Date();
    
    const img = unpackProcessImageResult(test);
    Module._free(test);
    Module._free(buffer);

    //console.log(buffer2);
    console.log(img);

 
    const ctx2 = canvas2.getContext("2d");

    var idata = ctx2.createImageData(300, 300);
    idata.data=img;
    // update canvas with new data
    ctx2.putImageData(img, 0, 0);

    const img_dataURI2 = canvas2.toDataURL('image/png');
        document.getElementById("myCanvas2").src = img_dataURI2
   
        console.log(end-start);
  }


  function unpackProcessImageResult(addr){
    const NUM_INT_FIELDS = 4
    const addr32 = addr / Module.HEAP32.BYTES_PER_ELEMENT
    const data32 = Module.HEAP32.slice(addr32, addr32 + NUM_INT_FIELDS)
    const image1 = unpackImage(data32.slice(0, 4))
    return image1
  }

  function unpackImage([width, height, channels, addr]){
    const cb = width * height * channels
    const data = Module.HEAPU8.slice(addr, addr + cb)
    console.log(channels);
    return channels===1 ? imageDataFrom1Channel(data, width, height) 
                        : imageDataFrom4Channels(data, width, height)
  }
  
  function imageDataFrom4Channels(data, width, height){
    console.log('[imageDataFrom4Channels]')
    const array = new Uint8ClampedArray(data)
    console.log(array);
    console.log(width);
    console.log(height);
    const imageData = new ImageData(array, width, height)
    return imageData
  }

  function imageDataFrom1Channel(data, width, height){
    console.log('[imageDataFrom1Channel]')
    const cb = width * height * 4
    const array = new Uint8ClampedArray(cb)
    data.forEach((pixelValue, index) => {
      const base = index * 4
      array[base] = pixelValue
      array[base + 1] = pixelValue
      array[base + 2] = pixelValue
      array[base + 3] = 255
    })
    const imageData = new ImageData(array, width, height)
    return imageData
  }


/*
function realiseProcess(image){

    start = new Date();

    console.log("je suis ici!");

    //let src = cv.imread(image);
    let src = cv.imread("myCanvas");
    console.log(src);
    let dst = new cv.Mat();
    let dsize = new cv.Size(300, 300);

    cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
    
    
    cv.cvtColor(dst, dst, cv.COLOR_BGR2GRAY, 0);
    cv.cvtColor(dst, dst, cv.COLOR_BGR2RGB, 0);


    let ksize = new cv.Size(5, 5);
    cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);


    let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);

  //cv.threshold(dst,dst,200, 177,cv.THRESH_OTSU);
    // You can try more different parameters
    //cv.erode(dst, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    cv.cvtColor(dst, dst, cv.COLOR_BGR2GRAY, 0);
    cv.Canny(dst, dst, 60, 35, 3, false);
    cv.threshold(dst, dst, 120, 200, cv.THRESH_BINARY);
    //let hierarchy = new cv.Mat();
    //You can try more different parameters

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); ++i) {
        let red = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let green = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0));
        let blue = Math.floor(Math.random() * (Math.floor(255) - Math.ceil(0) + 1) + Math.ceil(0)); 

        //console.log(contours.get(i));
        //console.log("R."+red+" G."+green+" B."+blue);
        let color2 =  new cv.Scalar(red,green, blue);  
        

        cv.drawContours(dst, contours, i, color2, 1, cv.LINE_8, hierarchy, 0);
    
    }

        
    cv.imshow("myCanvas2", dst);

    end = new Date();

    console.log(end-start);
}*/