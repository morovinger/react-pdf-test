import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import './App.css';

// Import placeholder image and logo
import placeholderImage from './image.png';
import logoImage from './logo.png';

function App() {
  const [loading, setLoading] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageBase64, setImageBase64] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [serverPdfUrl, setServerPdfUrl] = useState('');
  const [serverDownloadUrl, setServerDownloadUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [includeDescription, setIncludeDescription] = useState(false);
  
  // Test logo - base64 encoded sample logo
  const testLogoBase64 = 'data:image/png;base64,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';
  
  // Test description to add if checkbox is checked
  const testDescription = 'Это тестовое описание для документа о недвижимости. Оно включается в документ только если соответствующий флажок отмечен. Здесь может содержаться важная информация о данном отчете, правовые оговорки или другие пояснения.';

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

  // Convert images to base64 when component loads
  useEffect(() => {
    // Convert the imported images to base64
    const convertImage = (src, setBase64Function) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        setBase64Function(dataURL);
      };
      img.src = src;
    };

    // Convert placeholder image
    convertImage(placeholderImage, setImageBase64);
    
    // Convert logo image
    convertImage(logoImage, setLogoBase64);
    
    setImageReady(true);
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
        
        ${includeLogo ? `
        <div class="logo-container" style="text-align: center; margin: 20px 0;">
          <img src="${logoBase64}" alt="Тестовый логотип" style="max-width: 150px; max-height: 100px;">
        </div>
        ` : ''}
        
        ${includeDescription ? `
        <div class="test-description" style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <p style="font-style: italic;">${testDescription}</p>
        </div>
        ` : ''}
        
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
    
    // Updated server URL to match the actual running server
    const baseUrl = 'http://104.36.85.100:3001';
    
    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', new File([pdfBlob], fileName, { type: 'application/pdf' }));
      
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
        
        // Use the same baseUrl for consistency
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
          
          <div className="pdf-options">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={includeLogo} 
                onChange={(e) => setIncludeLogo(e.target.checked)} 
              />
              Добавить тестовый логотип
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={includeDescription} 
                onChange={(e) => setIncludeDescription(e.target.checked)} 
              />
              Добавить тестовое описание
            </label>
          </div>
          
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