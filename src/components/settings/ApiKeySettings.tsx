import { useState, useCallback, useEffect } from 'react';
import {
  Key,
  Check,
  AlertTriangle,
  X,
  ExternalLink,
  Loader2,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import {
  getApiKey,
  setApiKey,
  clearApiKey,
  hasApiKey,
  testApiKey,
} from '../../services/gemini';
import type { ApiKeyTestResult } from '../../services/gemini';

interface ApiKeySettingsProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function ApiKeySettings({ isOpen, onClose }: ApiKeySettingsProps) {
  const [inputValue, setInputValue] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ApiKeyTestResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      const key = getApiKey();
      setInputValue(key ?? '');
      setHasKey(hasApiKey());
      setSaved(false);
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSave = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      clearApiKey();
      setHasKey(false);
    } else {
      setApiKey(trimmed);
      setHasKey(true);
    }
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  }, [inputValue, onClose]);

  const handleClear = useCallback(() => {
    clearApiKey();
    setInputValue('');
    setHasKey(false);
    setSaved(false);
    setTestResult(null);
  }, []);

  const handleTest = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      setTestResult({
        success: false,
        message: 'API 키를 먼저 입력해주세요.',
        errorType: 'invalid',
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testApiKey(trimmed);
      setTestResult(result);
    } catch {
      setTestResult({
        success: false,
        message: '테스트 중 오류가 발생했습니다.',
        errorType: 'unknown',
      });
    } finally {
      setTesting(false);
    }
  }, [inputValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              API 키 설정
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Status */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              hasKey
                ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
            }`}
          >
            {hasKey ? (
              <>
                <Check className="w-4 h-4 flex-shrink-0" />
                API 키가 설정되어 있습니다
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                API 키가 설정되지 않았습니다
              </>
            )}
          </div>

          {/* Input */}
          <div>
            <label
              htmlFor="api-key-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                id="api-key-input"
                type="password"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setSaved(false);
                  setTestResult(null);
                }}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || inputValue.trim().length === 0}
                className="px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                테스트
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              키는 브라우저 localStorage에만 저장되며, 서버로 전송되지 않습니다.
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                testResult.success
                  ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
                  : testResult.errorType === 'leaked'
                    ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300'
                    : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : testResult.errorType === 'leaked' ? (
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-2">
                  <p className="whitespace-pre-line leading-relaxed">{testResult.message}</p>
                  {testResult.errorType === 'leaked' && (
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 font-medium text-xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      지금 새 API 키 발급받기 (무료)
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Help link */}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Google AI Studio에서 API 키 발급받기
          </a>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 rounded-lg transition-colors"
          >
            키 삭제
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saved}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-brand-500 text-white hover:bg-brand-600'
              }`}
            >
              {saved ? '저장됨!' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
