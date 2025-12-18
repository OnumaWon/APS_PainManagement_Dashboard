import React, { useState, useRef } from 'react';
import { Camera, Mic, Image as ImageIcon, Wand2, Loader2, UploadCloud } from 'lucide-react';
import { Card } from './ui/Card';
import { analyzeImage, editImage, transcribeAudio } from '../services/geminiService';

export const AiLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'edit' | 'audio'>('analyze');

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
        <TabButton active={activeTab === 'analyze'} onClick={() => setActiveTab('analyze')} icon={<Camera size={16} />} label="Image Analysis" />
        <TabButton active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} icon={<Wand2 size={16} />} label="Magic Editor" />
        <TabButton active={activeTab === 'audio'} onClick={() => setActiveTab('audio')} icon={<Mic size={16} />} label="Voice Transcribe" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'analyze' && <AnalysisTool />}
        {activeTab === 'edit' && <EditorTool />}
        {activeTab === 'audio' && <AudioTool />}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
      active 
      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' 
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

const AnalysisTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const text = await analyzeImage(base64, "Analyze this medical image or chart. Identify key anomalies, data points, or clinical signs.");
      setResult(text);
    } catch (e) {
      setResult("Error analyzing image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Upload Image" className="h-full">
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-center h-64 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
            <input type="file" onChange={handleFile} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
            {image ? (
                <img src={image} alt="Preview" className="max-h-full object-contain" />
            ) : (
                <>
                    <UploadCloud size={48} className="text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Click or drag to upload an image</p>
                </>
            )}
        </div>
        <button 
            onClick={handleAnalyze} 
            disabled={!image || loading}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
        >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
            Analyze with Gemini Pro
        </button>
      </Card>
      <Card title="Analysis Result" className="h-full">
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg h-64 overflow-y-auto text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-200 dark:border-slate-700 custom-scrollbar">
            {result || "Analysis results will appear here..."}
        </div>
      </Card>
    </div>
  );
};

const EditorTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    try {
        const base64 = image.split(',')[1];
        // Note: The service uses gemini-2.5-flash-image (Nano banana equivalent)
        const newImageData = await editImage(base64, prompt);
        setEditedImage(`data:image/png;base64,${newImageData}`);
    } catch (e) {
        alert("Error editing image");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <Card title="Original Image & Prompt" className="h-full">
         <div className="mb-4 h-48 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative">
            {image ? (
                <img src={image} alt="Original" className="h-full object-contain" />
            ) : (
                <div className="text-center p-4">
                    <input type="file" onChange={handleFile} accept="image/*" className="hidden" id="edit-upload"/>
                    <label htmlFor="edit-upload" className="cursor-pointer flex flex-col items-center">
                        <ImageIcon size={32} className="text-slate-400 mb-2"/>
                        <span className="text-sm text-slate-500 dark:text-slate-400">Upload Image</span>
                    </label>
                </div>
            )}
         </div>
         <div className="space-y-3">
             <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., 'Add a retro filter' or 'Remove background'"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
             />
             <button 
                onClick={handleEdit}
                disabled={!image || !prompt || loading}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex justify-center items-center gap-2"
             >
                 {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                 Generate Edit (Nano Banana)
             </button>
         </div>
       </Card>
       <Card title="Generated Result" className="h-full">
         <div className="h-full min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            {editedImage ? (
                <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain rounded" />
            ) : (
                <span className="text-slate-400 text-sm">Generated image appears here</span>
            )}
         </div>
       </Card>
    </div>
  );
};

const AudioTool = () => {
    const [recording, setRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [loading, setLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' }); // simplistic MIME
                // Convert blob to base64
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64 = (reader.result as string).split(',')[1];
                    setLoading(true);
                    try {
                        const text = await transcribeAudio(base64);
                        setTranscription(text);
                    } catch (e) {
                        setTranscription("Error transcribing audio.");
                    } finally {
                        setLoading(false);
                    }
                };
                reader.readAsDataURL(blob);
            };

            mediaRecorderRef.current.start();
            setRecording(true);
        } catch (err) {
            console.error(err);
            alert("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    return (
        <Card title="Voice Transcription" className="max-w-2xl mx-auto">
            <div className="flex flex-col items-center py-8">
                <button
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                        recording ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse ring-4 ring-red-50 dark:ring-red-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                >
                    <Mic size={32} />
                </button>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {recording ? "Recording... Click to stop" : "Click microphone to record notes"}
                </p>
            </div>
            
            <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Transcription</h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg min-h-[120px] text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {loading ? (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Loader2 className="animate-spin" size={16} />
                            Transcribing...
                        </div>
                    ) : (
                        transcription || "No transcription yet."
                    )}
                </div>
            </div>
        </Card>
    );
};