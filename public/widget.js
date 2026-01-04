(function() {
  'use strict';

  // Get the current script tag and read data attributes
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];

  var bookingUrl = currentScript.getAttribute('data-url');
  var buttonText = currentScript.getAttribute('data-button-text') || 'Book a meeting';
  var buttonColor = currentScript.getAttribute('data-button-color') || '#006BFF';

  if (!bookingUrl) {
    console.error('MeetFlow Widget: data-url attribute is required');
    return;
  }

  // Get the origin from the script src
  var scriptSrc = currentScript.src;
  var origin = scriptSrc.substring(0, scriptSrc.indexOf('/widget.js'));

  // Create button
  var button = document.createElement('button');
  button.textContent = buttonText;
  button.style.cssText =
    'background-color: ' + buttonColor + ';' +
    'color: white;' +
    'padding: 12px 24px;' +
    'border-radius: 8px;' +
    'border: none;' +
    'font-size: 16px;' +
    'font-weight: 500;' +
    'cursor: pointer;' +
    'transition: opacity 0.2s;' +
    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';

  button.onmouseover = function() {
    button.style.opacity = '0.9';
  };
  button.onmouseout = function() {
    button.style.opacity = '1';
  };

  // Insert button after the script tag
  currentScript.parentNode.insertBefore(button, currentScript.nextSibling);

  // Create modal
  var modal = document.createElement('div');
  modal.style.cssText =
    'display: none;' +
    'position: fixed;' +
    'top: 0;' +
    'left: 0;' +
    'width: 100%;' +
    'height: 100%;' +
    'background-color: rgba(0, 0, 0, 0.5);' +
    'z-index: 999999;' +
    'backdrop-filter: blur(4px);';

  // Create modal content container
  var modalContent = document.createElement('div');
  modalContent.style.cssText =
    'position: relative;' +
    'width: 90%;' +
    'max-width: 1000px;' +
    'height: 90%;' +
    'max-height: 800px;' +
    'margin: 2% auto;' +
    'background: white;' +
    'border-radius: 12px;' +
    'box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);' +
    'overflow: hidden;';

  // Create close button
  var closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.cssText =
    'position: absolute;' +
    'top: 16px;' +
    'right: 16px;' +
    'background: rgba(0, 0, 0, 0.5);' +
    'color: white;' +
    'border: none;' +
    'width: 36px;' +
    'height: 36px;' +
    'border-radius: 50%;' +
    'font-size: 24px;' +
    'cursor: pointer;' +
    'z-index: 1;' +
    'transition: background 0.2s;' +
    'display: flex;' +
    'align-items: center;' +
    'justify-content: center;' +
    'line-height: 1;';

  closeButton.onmouseover = function() {
    closeButton.style.background = 'rgba(0, 0, 0, 0.7)';
  };
  closeButton.onmouseout = function() {
    closeButton.style.background = 'rgba(0, 0, 0, 0.5)';
  };

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = origin + '/' + bookingUrl;
  iframe.style.cssText =
    'width: 100%;' +
    'height: 100%;' +
    'border: none;' +
    'border-radius: 12px;';

  // Assemble modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(iframe);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Open modal on button click
  button.onclick = function() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  // Close modal on close button click
  closeButton.onclick = function() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  };

  // Close modal on background click
  modal.onclick = function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  };

  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  });
})();
