// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyD_d7e6loADExTHf6N_gmQE8VBdPvhbOxE",
    authDomain: "old-movie-74317.firebaseapp.com",
    projectId: "old-movie-74317",
    storageBucket: "old-movie-74317.appspot.com",
    messagingSenderId: "764450178038",
    appId: "1:764450178038:web:edc0a7a10e74ae99393dd7",
    measurementId: "G-4XNK8W82WZ"
  };
  
  // Firebase 초기화
  firebase.initializeApp(firebaseConfig);
  
  const fileInput = document.querySelector('#poster-upload');
  const analyzeButton = document.querySelector('.analyze-btn');
  const output = document.querySelector('.output');
  const imagePreview = document.querySelector('#image-preview');
  const fileName = document.querySelector('#file-name');
  
  fileInput.addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
          fileName.textContent = file.name;
          const reader = new FileReader();
          reader.onload = function(e) {
              const img = document.createElement('img');
              img.src = e.target.result;
              imagePreview.innerHTML = '';
              imagePreview.appendChild(img);
          }
          reader.readAsDataURL(file);
      }
  });
  
  analyzeButton.onclick = async (ev) => {
    ev.preventDefault();
    output.textContent = '분석 중...';

    try {
        let file = fileInput.files[0];
        if (!file) {
            throw new Error('포스터 이미지를 업로드해주세요.');
        }

        let imageBase64 = await new Promise((resolve) => {
            let reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });

        const analyzeImage = firebase.functions().httpsCallable('analyzeImage');
        const result = await analyzeImage({ imageBase64: imageBase64, mimeType: file.type });

        // MarkdownIt 객체 생성을 try-catch 블록으로 감싸서 오류 처리
        try {
            let md = new window.markdownit();  // window.markdownit() 사용
            output.innerHTML = md.render(result.data);
        } catch (mdError) {
            console.error('MarkdownIt error:', mdError);
            output.textContent = result.data;  // 마크다운 변환 실패 시 일반 텍스트로 표시
        }
    } catch (e) {
        output.innerHTML += '<hr>' + e;
    }
};