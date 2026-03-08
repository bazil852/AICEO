import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export async function extractText(buffer, filename) {
  const ext = filename.split('.').pop().toLowerCase();

  switch (ext) {
    case 'pdf':
      return extractPdf(buffer);
    case 'docx':
      return extractDocx(buffer);
    case 'doc':
      return extractDocx(buffer);
    case 'txt':
    case 'csv':
    case 'json':
      return buffer.toString('utf-8');
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}

async function extractPdf(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

async function extractDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
