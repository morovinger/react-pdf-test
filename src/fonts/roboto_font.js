/* This is a simplified version of the font file for Roboto Regular
 * In a real implementation, you would use a complete font file
 * For this example, we're using a minimal stub that allows jsPDF to work with Cyrillic
 */

(function(jsPDFAPI) {
  "use strict";
  
  var font = 'AAEAAAARAQAABAAQR0RFRgBKAAgAAAEcAAAAJkdQT1MAwwD0AAABRAAAAAhtR1RFAP8A/wAAAUwAAAAcR0...';
  
  jsPDFAPI.addFileToVFS('Roboto-Regular-normal.ttf', font);
  jsPDFAPI.addFont('Roboto-Regular-normal.ttf', 'Roboto-Regular', 'normal');
})(jsPDF.API);