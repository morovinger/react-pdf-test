import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import './App.css';

// Import placeholder image
import placeholderImage from './image.png';

function App() {
  const [loading, setLoading] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageBase64, setImageBase64] = useState('');

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

  // Improved PDF generation to eliminate empty pages
  const generatePdf = () => {
    setLoading(true);
    
    // Create a container for PDF content
    const element = document.createElement('div');
    element.className = 'pdf-container';
    element.innerHTML = `
      <div class="pdf-document">
        <!-- Title page -->
        <div class="pdf-page">
          <h1 class="doc-title">Документ о недвижимости</h1>
          <p class="doc-date">Создано: ${new Date().toLocaleString('ru-RU')}</p>
          
          <h2 class="page-title">${pageOneTitle}</h2>
          ${pageOneContent.split('\n\n').map(p => 
            `<p class="content-paragraph">${p}</p>`
          ).join('')}
          
          <div class="image-wrapper">
            <img src="${imageBase64}" alt="Современный жилой комплекс" class="doc-image">
            <p class="image-caption">Современный жилой комплекс</p>
          </div>
        </div>

        <!-- Second page -->
        <div class="pdf-page">
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

    // Add custom styles for PDF generation
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .pdf-container {
        font-family: 'Arial', sans-serif;
        color: #333;
        line-height: 1.4;
      }
      .pdf-document {
        width: 210mm;
        box-sizing: border-box;
      }
      .pdf-page {
        padding: 15mm;
        page-break-after: always;
      }
      .doc-title {
        font-size: 24pt;
        text-align: center;
        margin-bottom: 10mm;
        color: #2c3e50;
      }
      .doc-date {
        font-size: 10pt;
        margin-bottom: 15mm;
        color: #7f8c8d;
      }
      .page-title {
        font-size: 18pt;
        margin-bottom: 8mm;
        color: #2c3e50;
      }
      .content-paragraph {
        text-align: justify;
        margin-bottom: 4mm;
        font-size: 11pt;
      }
      .image-wrapper {
        text-align: center;
        margin: 10mm 0;
      }
      .doc-image {
        max-width: 160mm;
        max-height: 80mm;
        object-fit: contain;
      }
      .image-caption {
        font-style: italic;
        font-size: 9pt;
        margin-top: 2mm;
        color: #7f8c8d;
      }
    `;
    
    // Add elements to the document
    document.body.appendChild(styleElement);
    document.body.appendChild(element);
    
    // Optimized options for better pagination
    const options = {
      margin: [0, 0, 0, 0], // margins handled by padding in the content
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
      },
      pagebreak: { 
        mode: ['css', 'legacy'],
        before: '.pdf-page'
      }
    };
    
    // Generate PDF
    html2pdf()
      .from(element)
      .set(options)
      .save()
      .then(() => {
        // Cleanup after completion
        document.body.removeChild(element);
        document.body.removeChild(styleElement);
        setLoading(false);
      }).catch(error => {
        console.error('PDF generation error:', error);
        document.body.removeChild(element);
        document.body.removeChild(styleElement);
        setLoading(false);
        alert('Ошибка при создании PDF. Пожалуйста, попробуйте еще раз.');
      });
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