const $ = (id) => document.getElementById(id);
const FALLBACK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

init();

let picking = false;
let idx = 0;
let cropper;

let imgArr = [];

function init() {
  for (let i = 0; i < 4; i++) {
    let div = document.createElement('div');
    let label = document.createElement('label');
    label.htmlFor = `img${i}`;
    let img = document.createElement('img');
    img.className = 'imgbtn';
    img.id = `preview${i}`;
    img.src = FALLBACK;
    let btn = document.createElement('button');
    btn.onclick = () => pickImage(i);
    btn.className = 'hidden';
    btn.id = `img${i}`;
    btn.textContent = 'Pick Image';
    label.append(img);
    div.append(label, btn);
    $('buttons').append(div);
  }
}

function pickImage(i) {
  if (picking) return;
  picking = true;
  idx = i;
  let fileSelector = document.createElement('input');
  fileSelector.type = 'file';
  fileSelector.accept = '.jpg, .jpeg, .png';
  fileSelector.onchange = () => cropImage(fileSelector);
  fileSelector.oncancel = () => picking = false;
  fileSelector.click();
}

async function cropImage(fileSelector) {
  $('cropper').src = await readURL(fileSelector.files[0]);
  cropper = new Cropper($('cropper'), {
    aspectRatio: 1 / COS_30,
    cropBoxMovable: false,
    cropBoxResizable: false,
    toggleDragModeOnDblclick: false,
    dragMode: 'move',
    guides: false,
    center: false,
    restore: false,
    autoCropArea: 1
  });
  $('crop').className = '';
}

function readURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => res(e.target.result);
    reader.onerror = e => rej(e);
    reader.readAsDataURL(file);
  });
};


async function cropEnd() {
  let cropped = cropper.getCroppedCanvas();
  $(`preview${idx}`).src = cropped.toDataURL();

  imgArr[idx] = cropped;
  drawKaleidocycle(...imgArr);

  $('crop').className = 'hidden';
  $('cropper').removeAttribute('src');
  cropper.destroy();

  picking = false;
  idx = undefined;

  if (imgArr.filter(x => !x).length == 0) $('generateBtn').removeAttribute('disabled');
}

function resetCrop() {
  cropper.reset();
}

function generateImage() {
  let a = document.createElement('a');
  a.href = scaledCanvas.toDataURL();
  a.download = 'kaleidocycle.png';
  a.click();
}