import FileSaver from 'file-saver';
import { asBlob } from 'html-docx-js-typescript';


export async function exportDocx(html: string, filename = 'cover-letter.docx') {
  const blob = (await asBlob(html)) as Blob; // force cast
  FileSaver(blob, filename);
}

