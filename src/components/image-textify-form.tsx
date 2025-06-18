
"use client";

import { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateImageFromText } from '@/ai/flows/generate-image-from-text';
// import NextImage from 'next/image'; // Standard img tag preferred for data URIs

export default function ImageTextifyForm() {
  const [textInput, setTextInput] = useState<string>("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleGenerateImage = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to generate an image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const result = await generateImageFromText({ text: textInput });
      if (result.image) {
        setGeneratedImage(result.image);
        toast({
          title: "Image Generated!",
          description: "Your image is ready to be downloaded.",
        });
      } else {
        throw new Error("AI did not return an image.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error Generating Image",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!generatedImage) return;

    const fileName = `image-textify-${Date.now()}.${format}`;
    const link = document.createElement('a');

    if (format === 'png') {
      link.href = generatedImage;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'jpeg') {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Use naturalWidth/Height to get original dimensions of the loaded image
        canvas.width = img.naturalWidth; 
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill background with white for JPG if original is PNG with transparency
          ctx.fillStyle = '#FFFFFF'; 
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
          link.href = jpegDataUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
            toast({ title: "Download Error", description: "Could not process image for JPEG download.", variant: "destructive"});
        }
      };
      img.onerror = () => {
        toast({ title: "Download Error", description: "Could not load image for conversion.", variant: "destructive"});
      };
      img.src = generatedImage;
    }
  };
  
  if (!isMounted) {
    // Render nothing or a basic skeleton on the server/first client render to avoid hydration issues
    // A more sophisticated skeleton can be used if preferred
    return (
        <div className="flex justify-center items-center min-h-[500px] w-full max-w-2xl">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl bg-card text-card-foreground rounded-lg overflow-hidden animate-fadeIn">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
      <CardHeader className="text-center p-6 border-b border-border">
        <div className="flex items-center justify-center mb-3">
          <ImageIcon className="h-10 w-10 mr-3 text-primary" />
          <CardTitle className="text-4xl font-headline text-primary">Image Textify</CardTitle>
        </div>
        <CardDescription className="text-md text-muted-foreground">
          Transform your words into stunning visuals. Enter your text below and let our AI craft a unique image for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <label htmlFor="text-input" className="block text-sm font-medium text-foreground mb-1">Enter your text</label>
          <Textarea
            id="text-input"
            placeholder="E.g., 'Hello World', a creative quote, or a marketing slogan..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={5}
            className="resize-none text-base bg-input placeholder-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent rounded-md p-3"
            aria-label="Text input for image generation"
          />
        </div>
        <Button
          onClick={handleGenerateImage}
          disabled={isLoading || !textInput.trim()}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 rounded-md transition-all duration-150 ease-in-out transform hover:scale-105 focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-live="polite"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Image"
          )}
        </Button>
      </CardContent>
      {generatedImage && (
        <CardFooter className="flex flex-col items-center space-y-4 p-6 border-t border-border">
          <div className="w-full max-w-md p-2 border border-border rounded-lg bg-muted/20 shadow-inner">
            <img 
              src={generatedImage} 
              alt="Generated image from text" 
              className="rounded-md w-full h-auto object-contain"
              style={{maxHeight: '400px'}}
              data-ai-hint="generated art"
            />
          </div>
          <div className="flex space-x-4 pt-2">
            <Button
              onClick={() => handleDownload('png')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-md"
              aria-label="Download image as PNG"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
            <Button
              onClick={() => handleDownload('jpeg')}
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-md"
              aria-label="Download image as JPEG"
            >
              <Download className="mr-2 h-4 w-4" />
              Download JPEG
            </Button>
          </div>
        </CardFooter>
      )}
      {!generatedImage && !isLoading && (
         <CardFooter className="flex flex-col items-center justify-center min-h-[100px] text-muted-foreground p-6 border-t border-border">
            <p>Your generated image will appear here.</p>
        </CardFooter>
      )}
    </Card>
  );
}
