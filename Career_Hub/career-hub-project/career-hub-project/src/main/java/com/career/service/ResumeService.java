package com.career.service;

import java.io.IOException;
import java.io.InputStream;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@Service
public class ResumeService {

	public String extractText(MultipartFile file) throws IOException{
		
		 if (file == null || file.isEmpty()) {
	            throw new IllegalArgumentException(
	                    "Please upload a PDF resume");
	        }
		 
		 try(
				 InputStream is = file.getInputStream();
				 PDDocument document = Loader.loadPDF(is.readAllBytes())
				 ){
			 
			 if(document.isEncrypted()) {
				 throw new IllegalArgumentException("Encrypted PDFs are not supported");
			 }
			 
			 PDFTextStripper stripper = new PDFTextStripper();
			 String text  =stripper.getText(document);
			 
			 if (text == null || text.isBlank()) {
	                throw new IllegalArgumentException(
	                        "No readable text found in PDF");
	            }

	            return text;
			 
		 }
		
		
	}

}
