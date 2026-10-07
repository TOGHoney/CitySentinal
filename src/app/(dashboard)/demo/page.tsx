"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, ApiError, AI_API_URL } from "@/lib/api";
import type { ModelInfo, ImagePredictionResponse } from "@/types/ai";

export default function DemoPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImagePredictionResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch models on mount
  useEffect(() => {
    api
      .getModels()
      .then((data) => {
        setModels(data);
        if (data.length > 0) setSelectedModel(data[0].id);
      })
      .catch(() => setError("Failed to load models. Is the backend running?"));
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }
    setSelectedFile(file);
    setError(null);
    setResult(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleAnalyze = async () => {
    if (!selectedFile || !selectedModel) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.predictImage(selectedFile, selectedModel);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An error occurred during inference");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">AI Detection Demo</h1>
        <p className="text-muted-foreground">
          Upload an image and select a detection model to analyze it.
        </p>
      </div>

      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detection Model</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Input Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
            {previewUrl ? (
              <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mx-auto max-h-[300px] rounded-lg object-contain"
                />
                <button
                  className="absolute right-2 top-2 rounded-full bg-background/80 p-1 hover:bg-background"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAll();
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag & drop an image here, or click to browse
                </p>
                <p className="text-muted-foreground text-xs">
                  JPG, PNG, or WebP — max 10 MB
                </p>
              </>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || !selectedModel || loading}
              className="flex-1 h-auto min-h-10 py-2 whitespace-normal text-center"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
                  <span>Wait about 1 minute for the response(This slow outputs are because of the slow computational power of render free tier for AI models)</span>
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4 shrink-0" />
                  Analyze
                </>
              )}
            </Button>
            {selectedFile && (
              <Button variant="outline" onClick={clearAll} disabled={loading}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Annotated Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detection Result</CardTitle>
            </CardHeader>
            <CardContent>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${AI_API_URL}${result.result_url}`}
                alt="Annotated result"
                className="w-full rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Detection Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>
                  <strong>{result.count}</strong> detection{result.count !== 1 ? "s" : ""} found
                </span>
              </div>

              <div className="text-muted-foreground text-xs">
                Processed in {result.processing_time_ms}ms
              </div>

              {result.detections.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Detections</h4>
                  <div className="max-h-[300px] space-y-2 overflow-y-auto">
                    {result.detections.map((det, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm"
                      >
                        <span className="font-medium capitalize">
                          {det.class_name.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {(det.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
