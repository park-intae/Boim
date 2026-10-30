import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  useUploadDocument,
  useParseDocument,
  useParseSampleDocument,
} from '../../api/useDocumentQueries';
import type { ParsedInsuranceData } from '@boim/shared-types';

interface PolicyDocumentUploaderProps {
  onParsed: (data: ParsedInsuranceData) => void;
}

export function PolicyDocumentUploader({ onParsed }: PolicyDocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsingStep, setParsingStep] = useState<
    'idle' | 'uploading' | 'parsing' | 'done' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: uploadDocument } = useUploadDocument();
  const { mutateAsync: parseDocument } = useParseDocument();
  const { mutateAsync: parseSampleDocument } = useParseSampleDocument();

  const handleProcessFile = async (file: File) => {
    setErrorMessage('');
    try {
      setParsingStep('uploading');
      setStatusMessage('증권 파일을 업로드하고 있습니다...');

      const uploadRes = await uploadDocument({ file });

      setParsingStep('parsing');
      setStatusMessage('문서 텍스트에서 보험 계약 정보를 추출하는 중입니다...');

      const parseRes = await parseDocument({ documentId: uploadRes.documentId });
      const parsedData =
        parseRes?.parsedData ||
        (parseRes as unknown as { data?: { parsedData?: ParsedInsuranceData } })?.data
          ?.parsedData ||
        (parseRes as unknown as ParsedInsuranceData);

      setParsingStep('done');
      setStatusMessage('분석 완료! 폼에 정보가 자동 입력되었습니다.');
      if (parsedData && 'institution' in parsedData) {
        onParsed(parsedData);
      }
    } catch (err) {
      setParsingStep('error');
      setErrorMessage(
        (err as Error).message || '증권 분석 중 오류가 발생했습니다. 직접 입력해 주세요.',
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const handleSampleClick = async () => {
    setErrorMessage('');
    try {
      setParsingStep('parsing');
      setStatusMessage('모의 증권 샘플 계약 정보를 분석 중입니다...');

      const parseRes = await parseSampleDocument();
      const parsedData =
        parseRes?.parsedData ||
        (parseRes as unknown as { data?: { parsedData?: ParsedInsuranceData } })?.data
          ?.parsedData ||
        (parseRes as unknown as ParsedInsuranceData);

      setParsingStep('done');
      setStatusMessage('샘플 증권 분석 완료! 폼에 정보가 채워졌습니다.');
      if (parsedData && 'institution' in parsedData) {
        onParsed(parsedData);
      }
    } catch (err) {
      setParsingStep('error');
      setErrorMessage((err as Error).message || '샘플 분석 실패');
    }
  };

  const isBusy = parsingStep === 'uploading' || parsingStep === 'parsing';

  return (
    <div className="flex flex-col gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-[13px] font-bold text-gray-900">
            증권 파일로 간편 자동 채우기
          </span>
        </div>
        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
          빠른 입력
        </span>
      </div>

      <p className="text-[12px] text-gray-600 leading-relaxed">
        보험 증권(PDF, 이미지)을 올리시면 계약 정보가 폼에 자동으로 채워집니다.
      </p>

      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isBusy && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-100/50 scale-[0.99]'
            : 'border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
        } ${isBusy ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        {isBusy ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-[12px] font-bold text-indigo-900">
              {statusMessage}
            </span>
          </div>
        ) : parsingStep === 'done' ? (
          <div className="flex flex-col items-center gap-1.5 py-1 text-emerald-600">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span className="text-[12px] font-bold">{statusMessage}</span>
            <span className="text-[11px] text-gray-500 font-medium">
              다른 파일로 다시 분석하려면 클릭하세요
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-center">
            <UploadCloud className="w-6 h-6 text-indigo-500" />
            <span className="text-[12px] font-bold text-gray-800">
              증권 파일 선택 또는 여기로 드래그
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              PDF, PNG, JPG, TXT (최대 10MB)
            </span>
          </div>
        )}
      </div>

      {parsingStep === 'error' && (
        <div className="flex items-center gap-1.5 text-red-600 text-[11px] font-semibold bg-red-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 원클릭 모의 샘플 테스트 버튼 */}
      <button
        type="button"
        disabled={isBusy}
        onClick={handleSampleClick}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 text-indigo-600 border border-indigo-200 rounded-xl text-[12px] font-bold transition-all shadow-xs"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>🧪 가상 모의 증권 샘플로 원클릭 분석해보기</span>
      </button>
    </div>
  );
}
