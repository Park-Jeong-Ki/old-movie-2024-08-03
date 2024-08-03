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
  const analytics = firebase.analytics();
  
  const API_KEY = 'YOUR_KEY';
  
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
  
          let contents = [
              {
                  role: 'user',
                  parts: [
                      { inline_data: { mime_type: file.type, data: imageBase64 } },
                      { text: "이 영화 포스터를 분석하고, 이와 비슷한 1900년대의 고전 명작 영화 5편을 추천해주세요. 각 추천 영화에 대해 간단한 설명과 추천 이유를 포함해주세요." }
                  ]
              }
          ];
  
          const genAI = new GoogleGenerativeAI(API_KEY);
          const model = genAI.getGenerativeModel({
              model: "gemini-1.5-pro",
              safetySettings: [
                  {
                      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                  },
              ],
          });
  
          const result = await model.generateContentStream({ contents });
  
          let buffer = [];
          let md = new MarkdownIt();
          for await (let response of result.stream) {
              buffer.push(response.text());
              output.innerHTML = md.render(buffer.join(''));
          }
      } catch (e) {
          output.innerHTML += '<hr>' + e;
      }
  };