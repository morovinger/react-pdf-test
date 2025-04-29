import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import './App.css';

// Import placeholder image
import placeholderImage from './image.png';

function App() {
  const [loading, setLoading] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageBase64, setImageBase64] = useState('');
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [serverPdfUrl, setServerPdfUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [captcha, setCaptcha] = useState({ question: '', sessionId: '' });
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  // Содержимое для первой и второй страницы
  const pageOneTitle = 'Рынок недвижимости в 2025 году';
  const pageOneContent = `Рынок недвижимости в 2025 году демонстрирует стабильный рост в большинстве регионов. Аналитики отмечают увеличение спроса на жилые комплексы с развитой инфраструктурой и энергоэффективными технологиями. Особенно популярными становятся квартиры с возможностью удаленной работы и зонами отдыха.

В секторе коммерческой недвижимости наблюдается трансформация офисных пространств под гибридный формат работы. Девелоперы активно внедряют "умные" технологии в новые проекты, что повышает их привлекательность для арендаторов.

Инвестиции в недвижимость остаются надежным способом сохранения и приумножения капитала. Доходность от аренды жилой недвижимости в престижных районах составляет в среднем 5-7% годовых, что превышает ставки по банковским депозитам.

Ипотечное кредитование становится доступнее благодаря государственным программам поддержки. Средняя ставка по ипотеке составляет 6,5%, что стимулирует приобретение жилья среди молодых семей.`;

  const pageTwoTitle = 'Тенденции рынка недвижимости';
  const pageTwoContent = `Современные тренды в архитектуре жилых комплексов отражают растущий спрос на экологичность и функциональность. Проекты с вертикальным озеленением, солнечными панелями и системами сбора дождевой воды привлекают внимание покупателей, заботящихся об окружающей среде.

Загородная недвижимость переживает новый пик популярности, что связано с возможностью удаленной работы и стремлением к комфортной жизни вдали от городского шума. Коттеджные поселки с развитой инфраструктурой, включающей спортивные объекты и образовательные учреждения, пользуются повышенным спросом.

Цифровизация рынка недвижимости привела к распространению виртуальных туров и онлайн-сделок. Технология блокчейн начинает применяться для регистрации прав собственности, что обеспечивает прозрачность и безопасность транзакций.

Инвестиционные фонды недвижимости (REIT) становятся популярным инструментом для тех, кто хочет диверсифицировать свой портфель, но не имеет возможности приобрести объект недвижимости целиком. Средняя доходность таких фондов в 2024 году составила около 8,3%.

Стоимость квадратного метра в престижных районах мегаполисов продолжает расти, несмотря на экономические колебания. Эксперты прогнозируют, что эта тенденция сохранится в ближайшие годы, делая инвестиции в недвижимость перспективным направлением.`;

  // Convert image to base64 when component loads
  useEffect(() => {
    // Convert the imported image to base64
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      setImageBase64(dataURL);
      setImageReady(true);
    };
    img.src = placeholderImage;
  }, []);

  // Cleanup PDF URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Improved PDF generation to eliminate empty pages and store the PDF blob
  const generatePdf = () => {
    setLoading(true);
    
    // Single continuous content approach to avoid empty pages completely
    const element = document.createElement('div');
    element.className = 'pdf-container';
    element.innerHTML = `
      <div class="pdf-document">
        <h1 class="doc-title">Документ о недвижимости</h1>
        <p class="doc-date">Создано: ${new Date().toLocaleString('ru-RU')}</p>
        
        <div class="content-section">
          <h2 class="page-title">${pageOneTitle}</h2>
          ${pageOneContent.split('\n\n').map(p => 
            `<p class="content-paragraph">${p}</p>`
          ).join('')}
          
          <div class="image-wrapper">
            <img src="${imageBase64}" alt="Современный жилой комплекс" class="doc-image">
            <p class="image-caption">Современный жилой комплекс</p>
          </div>
        </div>

        <div class="content-section">
          <h2 class="page-title">${pageTwoTitle}</h2>
          ${pageTwoContent.split('\n\n').map(p => 
            `<p class="content-paragraph">${p}</p>`
          ).join('')}
          
          <div class="image-wrapper">
            <img src="${imageBase64}" alt="График роста цен на недвижимость" class="doc-image">
            <p class="image-caption">График роста цен на недвижимость</p>
          </div>
        </div>
      </div>
    `;

    // Append element to document body
    document.body.appendChild(element);
    
    // Simplified options focused on continuous flow
    const options = {
      margin: 10,
      filename: 'nedvizhimost-document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };
    
    // Generate PDF as blob instead of saving directly
    html2pdf()
      .from(element)
      .set(options)
      .outputPdf('blob')
      .then((blob) => {
        // Store the blob and create a URL for it
        setPdfBlob(blob);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        
        // Manually trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'nedvizhimost-document.pdf';
        link.click();
        
        // Cleanup after completion
        document.body.removeChild(element);
        setLoading(false);
        setPdfGenerated(true);
        
        // Upload the PDF to the server
        uploadPdfToServer(blob);
      }).catch(error => {
        console.error('PDF generation error:', error);
        document.body.removeChild(element);
        setLoading(false);
        alert('Ошибка при создании PDF. Пожалуйста, попробуйте еще раз.');
      });
  };

  // Function to fetch captcha from server
  const fetchCaptcha = async () => {
    try {
      // Get the base URL dynamically
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:3001';
      
      const response = await fetch(`${baseUrl}/api/captcha`);
      if (!response.ok) {
        throw new Error('Failed to fetch captcha');
      }
      
      const data = await response.json();
      setCaptcha({
        question: data.question,
        sessionId: data.sessionId
      });
    } catch (error) {
      console.error('Error fetching captcha:', error);
    }
  };

  // Fetch captcha when PDF is generated
  useEffect(() => {
    if (pdfGenerated && pdfBlob) {
      fetchCaptcha();
    }
  }, [pdfGenerated, pdfBlob]);

  // Function to upload PDF to server
  const uploadPdfToServer = async (pdfBlob) => {
    setUploading(true);
    try {
      // Check if captcha is filled
      if (!captchaAnswer) {
        alert('Пожалуйста, решите капчу перед загрузкой файла');
        setUploading(false);
        return;
      }

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', new File([pdfBlob], 'nedvizhimost-document.pdf', { type: 'application/pdf' }));
      formData.append('captchaSessionId', captcha.sessionId);
      formData.append('captchaAnswer', captchaAnswer);
      
      // Get the base URL dynamically
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:3001';
      
      // Send the file to your server endpoint
      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }
      
      const data = await response.json();
      
      // Save the URL returned from the server
      setServerPdfUrl(data.fileUrl);
      setUploading(false);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploading(false);
      alert(`Не удалось загрузить документ на сервер: ${error.message}. Используется локальная версия.`);
      // Fetch new captcha if the current one failed
      fetchCaptcha();
      setCaptchaAnswer('');
    }
  };

  // Share handlers updated to share the server PDF URL
  const shareToFacebook = () => {
    const urlToShare = serverPdfUrl || window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}`, '_blank');
  };

  const shareToVK = () => {
    const urlToShare = serverPdfUrl || window.location.href;
    window.open(`https://vk.com/share.php?url=${encodeURIComponent(urlToShare)}`, '_blank');
  };

  const shareToTelegram = () => {
    if (serverPdfUrl) {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(serverPdfUrl)}&text=Документ о недвижимости`, '_blank');
    } else if (pdfUrl) {
      // Fallback to Web Share API or local URL if server URL is not available
      if (navigator.share) {
        navigator.share({
          title: 'Документ о недвижимости',
          files: [new File([pdfBlob], 'nedvizhimost-document.pdf', { type: 'application/pdf' })]
        }).catch(() => {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Документ о недвижимости`, '_blank');
        });
      } else {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=Документ о недвижимости`, '_blank');
      }
    } else {
      alert('Пожалуйста, сначала создайте PDF документ.');
    }
  };
  
  const shareToWhatsApp = () => {
    if (serverPdfUrl) {
      window.open(`https://api.whatsapp.com/send?text=Документ о недвижимости: ${encodeURIComponent(serverPdfUrl)}`, '_blank');
    } else if (pdfUrl) {
      window.open(`https://api.whatsapp.com/send?text=Документ о недвижимости: ${encodeURIComponent(pdfUrl)}`, '_blank');
    } else {
      alert('Пожалуйста, сначала создайте PDF документ.');
    }
  };

  const shareByEmail = () => {
    if (serverPdfUrl) {
      window.location.href = `mailto:?subject=Документ о недвижимости&body=Ознакомьтесь с документом о недвижимости: ${encodeURIComponent(serverPdfUrl)}`;
    } else if (pdfUrl) {
      window.location.href = `mailto:?subject=Документ о недвижимости&body=Ознакомьтесь с документом о недвижимости: ${encodeURIComponent(pdfUrl)}`;
    } else {
      alert('Пожалуйста, сначала создайте PDF документ.');
    }
  };

  const downloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'nedvizhimost-document.pdf';
      link.click();
    } else {
      alert('Пожалуйста, сначала создайте PDF документ.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Генератор PDF о недвижимости</h1>
        <div className="pdf-generator">
          <button 
            onClick={generatePdf}
            disabled={loading || !imageReady}
          >
            {loading ? 'Создание PDF...' : 'Скачать PDF о недвижимости'}
          </button>
          {!imageReady && <p>Подготовка изображений...</p>}
          
          {/* Share bar */}
          {pdfGenerated && (
            <div className="share-bar">
              <p>Поделиться документом:</p>
              {!serverPdfUrl && (
                <div className="captcha-container">
                  <p className="captcha-question">{captcha.question}</p>
                  <input
                    type="text"
                    className="captcha-input"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Введите ответ"
                  />
                  <button 
                    className="upload-button" 
                    onClick={() => uploadPdfToServer(pdfBlob)}
                    disabled={uploading || !captcha.sessionId}
                  >
                    {uploading ? "Загрузка..." : "Загрузить для обмена"}
                  </button>
                  <button 
                    className="refresh-captcha" 
                    onClick={fetchCaptcha}
                    disabled={uploading}
                  >
                    Обновить капчу
                  </button>
                </div>
              )}
              {uploading && <p className="upload-status">Загрузка документа на сервер...</p>}
              {serverPdfUrl && <p className="upload-success">Документ успешно загружен и готов к отправке!</p>}
              <div className="share-buttons">
                <button className="share-button facebook" onClick={shareToFacebook} title="Поделиться через Facebook">
                  <i className="share-icon facebook-icon"></i>
                </button>
                <button className="share-button vk" onClick={shareToVK} title="Поделиться через ВКонтакте">
                  <i className="share-icon vk-icon"></i>
                </button>
                <button className="share-button telegram" onClick={shareToTelegram} title="Поделиться через Telegram">
                  <i className="share-icon telegram-icon"></i>
                </button>
                <button className="share-button whatsapp" onClick={shareToWhatsApp} title="Поделиться через WhatsApp">
                  <i className="share-icon whatsapp-icon"></i>
                </button>
                <button className="share-button email" onClick={shareByEmail} title="Отправить по Email">
                  <i className="share-icon email-icon"></i>
                </button>
                <button className="share-button download" onClick={downloadPdf} title="Скачать PDF">
                  <i className="share-icon download-icon"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <div className="content-preview">
        <section className="page">
          <h2>{pageOneTitle}</h2>
          <div className="text-content">
            {pageOneContent.split('\n\n').map((paragraph, idx) => (
              <p key={`p1-${idx}`}>{paragraph}</p>
            ))}
          </div>
          <div className="image-container">
            <img 
              src={placeholderImage} 
              alt="Современный жилой комплекс" 
              style={{width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover'}}
            />
          </div>
        </section>
        
        <section className="page">
          <h2>{pageTwoTitle}</h2>
          <div className="text-content">
            {pageTwoContent.split('\n\n').map((paragraph, idx) => (
              <p key={`p2-${idx}`}>{paragraph}</p>
            ))}
          </div>
          <div className="image-placeholder">
            <div className="placeholder-box">
              <img 
                src={placeholderImage} 
                alt="График роста цен на недвижимости" 
                style={{width: '100%', height: 'auto', maxHeight: '300px'}} 
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;