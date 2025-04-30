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
  const [serverDownloadUrl, setServerDownloadUrl] = useState('');
  const [uploading, setUploading] = useState(false);

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
      }).catch(error => {
        console.error('PDF generation error:', error);
        document.body.removeChild(element);
        setLoading(false);
        alert('Ошибка при создании PDF. Пожалуйста, попробуйте еще раз.');
      });
  };

  // Function to generate PDF and then upload it
  const generatePdfAndUpload = () => {
    generatePdf();
  };

  useEffect(() => {
    // Upload PDF to server when generated
    if (pdfGenerated && pdfBlob && !serverPdfUrl && !uploading) {
      uploadPdfToServer(pdfBlob);
    }
  }, [pdfGenerated, pdfBlob]);

  // Function to upload PDF to server
  const uploadPdfToServer = async (pdfBlob) => {
    setUploading(true);
    // Define fileName outside try block so it's available in catch
    const fileName = 'nedvizhimost-document.pdf';
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', new File([pdfBlob], fileName, { type: 'application/pdf' }));
      
      // Get the base URL dynamically
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:3001';
      
      console.log('Uploading PDF to server:', baseUrl);
      
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
      console.log('Server response:', data);
      
      // Fix URL format if needed - remove any @ symbol at the beginning
      let fileUrl = data.fileUrl;
      if (fileUrl && fileUrl.startsWith('@')) {
        fileUrl = fileUrl.substring(1);
      }
      
      // Convert /uploads/ URL to /download/ URL for automatic downloads
      if (fileUrl && data.fileName) {
        // Extract the filename from the URL or use data.fileName
        const urlParts = fileUrl.split('/');
        const justFileName = urlParts[urlParts.length - 1];
        
        // Create a download URL that will trigger automatic download
        const downloadBaseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/uploads/'));
        const downloadUrl = `${downloadBaseUrl}/download/${justFileName}`;
        
        console.log('Download URL:', downloadUrl);
        data.downloadUrl = downloadUrl;
        
        // Keep both URLs - one for viewing, one for downloading
        setServerPdfUrl(fileUrl);
      } else {
        setServerPdfUrl(fileUrl);
      }
      
      // Store download URL for direct downloads
      if (data.downloadUrl) {
        setServerDownloadUrl(data.downloadUrl);
      }
      
      // Verify the file exists on the server after upload
      if (data.fileName) {
        try {
          const verifyResponse = await fetch(`${baseUrl}/check-file/${data.fileName}`);
          const verifyData = await verifyResponse.json();
          
          if (!verifyData.exists) {
            console.error('Warning: File uploaded but not found during verification check');
            alert('Документ был загружен, но есть проблема с доступом к нему. Проверьте настройки сервера.');
          } else {
            console.log('File verified on server:', verifyData);
          }
        } catch (verifyError) {
          console.error('Error verifying file on server:', verifyError);
        }
      }
      
      // Check for HTTPS warning
      if (data.isHttps === false) {
        console.warn('Server is using HTTP, not HTTPS. This may cause security issues with blob URLs.');
      }
      
      setUploading(false);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      
      // Implement a retry mechanism instead of using a different server
      try {
        console.log('Retrying upload with delay...');
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a new FormData object for the retry
        const retryFormData = new FormData();
        retryFormData.append('file', new File([pdfBlob], fileName, { type: 'application/pdf' }));
        
        // Use the same server but with a direct IP address if possible
        const baseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:3001' 
          : 'http://104.36.85.100:3001';
          
        console.log('Retrying upload to:', baseUrl);
        
        const retryResponse = await fetch(`${baseUrl}/upload`, {
          method: 'POST',
          body: retryFormData,
        });
        
        if (!retryResponse.ok) {
          throw new Error('Retry upload failed');
        }
        
        const retryData = await retryResponse.json();
        console.log('Retry response:', retryData);
        
        // Fix URL format if needed
        let fileUrl = retryData.fileUrl;
        if (fileUrl && fileUrl.startsWith('@')) {
          fileUrl = fileUrl.substring(1);
        }
        
        // Convert to download URL
        if (fileUrl) {
          const urlParts = fileUrl.split('/');
          const justFileName = urlParts[urlParts.length - 1];
          
          const downloadBaseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/uploads/'));
          const downloadUrl = `${downloadBaseUrl}/download/${justFileName}`;
          
          console.log('Retry download URL:', downloadUrl);
          retryData.downloadUrl = downloadUrl;
        }
        
        setServerPdfUrl(fileUrl);
        
        // Store download URL for direct downloads
        if (retryData.downloadUrl) {
          setServerDownloadUrl(retryData.downloadUrl);
        }
      } catch (retryError) {
        console.error('Retry upload failed:', retryError);
        alert(`Не удалось загружать документ на сервер: ${error.message}. Используется локальная версия.`);
      } finally {
        setUploading(false);
      }
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
    if (serverDownloadUrl) {
      // Use the direct download URL from the server
      window.location.href = serverDownloadUrl;
    } else if (pdfUrl) {
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
            onClick={generatePdfAndUpload}
            disabled={loading || !imageReady}
          >
            {loading ? 'Создание PDF...' : 'Скачать PDF о недвижимости'}
          </button>
          {!imageReady && <p>Подготовка изображений...</p>}
          
          {/* Share bar */}
          {pdfGenerated && (
            <div className="share-bar">
              <p>Поделиться документом:</p>
              {uploading && <p className="upload-status">Загрузка документа на сервер...</p>}
              {serverPdfUrl && (
                <>
                  <p className="upload-success">Документ успешно загружен и готов к отправке!</p>
                  {!serverPdfUrl.startsWith('https://') && (
                    <p className="warning">Внимание: Документ загружен по незащищенному протоколу (HTTP). Для полной функциональности рекомендуется использовать HTTPS.</p>
                  )}
                </>
              )}
              
              <div className="share-buttons">
                <button onClick={shareToFacebook} disabled={uploading || !pdfGenerated}>
                  Поделиться в Facebook
                </button>
                <button onClick={shareToVK} disabled={uploading || !pdfGenerated}>
                  Поделиться в VK
                </button>
                <button onClick={shareToTelegram} disabled={uploading || !pdfGenerated}>
                  Отправить в Telegram
                </button>
                <button onClick={shareByEmail} disabled={uploading || !pdfGenerated}>
                  Отправить по Email
                </button>
                <button onClick={downloadPdf} disabled={!pdfGenerated}>
                  Скачать PDF снова
                </button>
              </div>
              
              {/* Server file info and troubleshooting */}
              {serverPdfUrl && (
                <div className="server-info">
                  <p>Информация о файле на сервере:</p>
                  <code>{serverPdfUrl}</code>
                  <div className="server-actions">
                    <button 
                      onClick={() => window.open(serverPdfUrl, '_blank')}
                      className="test-link-btn view-btn"
                    >
                      Просмотреть PDF
                    </button>
                    <button 
                      onClick={() => window.location.href = serverDownloadUrl || serverPdfUrl.replace('/uploads/', '/download/')}
                      className="test-link-btn download-btn"
                    >
                      Скачать PDF напрямую
                    </button>
                  </div>
                </div>
              )}
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