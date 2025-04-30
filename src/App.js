import React from 'react';
import './App.css';

function App() {
  // Hardcoded static PDF URL
  const staticPdfUrl = 'http://104.36.85.100:3000/static-pdf';

  return (
    <div className="App">
      <header className="App-header">
        <h1>Документ о недвижимости</h1>
        <div className="pdf-generator">
          <a 
            href={staticPdfUrl}
            download="nedvizhimost-document.pdf"
            className="download-button"
          >
            Скачать PDF о недвижимости
          </a>
          
          <div className="share-bar">
            <p>Поделиться документом:</p>
            <p className="static-url">
              Постоянная ссылка: <a href={staticPdfUrl} target="_blank" rel="noreferrer">{staticPdfUrl}</a>
            </p>
            <div className="share-buttons">
              <a
                className="share-button facebook"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(staticPdfUrl)}`}
                target="_blank"
                rel="noreferrer"
                title="Поделиться через Facebook"
              >
                <i className="share-icon facebook-icon"></i>
              </a>
              <a
                className="share-button vk"
                href={`https://vk.com/share.php?url=${encodeURIComponent(staticPdfUrl)}`}
                target="_blank"
                rel="noreferrer"
                title="Поделиться через ВКонтакте"
              >
                <i className="share-icon vk-icon"></i>
              </a>
              <a
                className="share-button telegram"
                href={`https://t.me/share/url?url=${encodeURIComponent(staticPdfUrl)}&text=Документ о недвижимости`}
                target="_blank"
                rel="noreferrer"
                title="Поделиться через Telegram"
              >
                <i className="share-icon telegram-icon"></i>
              </a>
              <a
                className="share-button whatsapp"
                href={`https://api.whatsapp.com/send?text=Документ о недвижимости: ${encodeURIComponent(staticPdfUrl)}`}
                target="_blank"
                rel="noreferrer"
                title="Поделиться через WhatsApp"
              >
                <i className="share-icon whatsapp-icon"></i>
              </a>
              <a
                className="share-button email"
                href={`mailto:?subject=Документ о недвижимости&body=Ознакомьтесь с документом о недвижимости: ${encodeURIComponent(staticPdfUrl)}`}
                title="Отправить по Email"
              >
                <i className="share-icon email-icon"></i>
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;