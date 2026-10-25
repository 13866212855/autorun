'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  KeyRound,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  History,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  ListOrdered,
} from 'lucide-react';

interface ModelConfigData {
  baseUrl: string;
  apiKeyMasked: string;
  textModel: string;
  imageModel: string;
  updatedAt: string;
}

interface TaskRecordItem {
  id: string;
  timestamp: string;
  targetUrl: string;
  domain: string;
  excelFileName?: string;
  imageFileNames?: string[];
  recordIndex: number;
  totalRecords: number;
  mappedFieldsCount: number;
  successCount: number;
  failCount: number;
  status: 'success' | 'partial' | 'failed';
  details: Array<{
    sourceField: string;
    sourceValue: any;
    selector: string;
    targetLabel?: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<'config' | 'tasks'>('config');

  // Config state
  const [config, setConfig] = useState<ModelConfigData | null>(null);
  const [baseUrlInput, setBaseUrlInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [textModelInput, setTextModelInput] = useState('');
  const [imageModelInput, setImageModelInput] = useState('');
  const [configLoading, setConfigLoading] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Models fetched from provider
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);

  // Test connection state
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    httpStatus?: number;
    message: string;
    reply?: string;
    availableModels?: string[];
  } | null>(null);

  // Tasks state
  const [tasks, setTasks] = useState<TaskRecordItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'success' | 'partial' | 'failed'>('all');

  function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Check auth on mount
  useEffect(() => {
    let ignore = false;
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/admin/config', { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore) {
          if (data) {
            setIsLoggedIn(true);
            setConfig(data);
            setBaseUrlInput(data.baseUrl || '');
            setApiKeyInput(data.apiKeyMasked || '');
            setTextModelInput(data.textModel || '');
            setImageModelInput(data.imageModel || '');
          } else {
            setIsLoggedIn(false);
          }
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setIsLoggedIn(false);
          setCheckingAuth(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || '登录失败，请检查账号密码');
        setLoginLoading(false);
        return;
      }

      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('admin_token', data.token);
      }

      setIsLoggedIn(true);
      setPassword('');
      await loadConfig();
    } catch (err: any) {
      setLoginError(err.message || '网络通信异常');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST', headers: getAuthHeaders() });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
      setIsLoggedIn(false);
      setConfig(null);
    }
  }

  async function loadConfig() {
    try {
      setConfigLoading(true);
      const res = await fetch('/api/admin/config', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setBaseUrlInput(data.baseUrl || '');
        setApiKeyInput(data.apiKeyMasked || '');
        setIsEditingKey(false);
        setTextModelInput(data.textModel || '');
        setImageModelInput(data.imageModel || '');
      }
    } finally {
      setConfigLoading(false);
    }
  }

  async function handleSaveConfig(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setConfigLoading(true);
    setConfigMessage(null);

    try {
      const payload: any = {
        baseUrl: baseUrlInput.trim(),
        textModel: textModelInput.trim().toLowerCase(),
        imageModel: imageModelInput.trim().toLowerCase(),
      };

      // Only include apiKey if user explicitly modified it
      if (isEditingKey && apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setConfigMessage({ type: 'error', text: data.error || '保存配置失败' });
      } else {
        setConfigMessage({ type: 'success', text: '大模型参数已成功保存并实时生效！' });
        setConfig(data.config);
        setApiKeyInput(data.config.apiKeyMasked);
        setIsEditingKey(false);
      }
    } catch (err: any) {
      setConfigMessage({ type: 'error', text: err.message || '网络保存异常' });
    } finally {
      setConfigLoading(false);
    }
  }

  // Restore recommended default configuration
  async function handleRestoreDefault() {
    setBaseUrlInput('https://apihub.agnes-ai.com/v1');
    setTextModelInput('agnes-2.5-flash');
    setImageModelInput('agnes-2.5-flash');
    setIsEditingKey(true);
    setApiKeyInput('sk-vWM7RHG5n7bljBNi3GgHfygxqiKlUYrPWZLLSUByIGm4BiM9');

    try {
      setConfigLoading(true);
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          baseUrl: 'https://apihub.agnes-ai.com/v1',
          apiKey: 'sk-vWM7RHG5n7bljBNi3GgHfygxqiKlUYrPWZLLSUByIGm4BiM9',
          textModel: 'agnes-2.5-flash',
          imageModel: 'agnes-2.5-flash',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
        setApiKeyInput(data.config.apiKeyMasked);
        setIsEditingKey(false);
        setConfigMessage({ type: 'success', text: '已恢复推荐配置并持久化保存！' });
      }
    } finally {
      setConfigLoading(false);
    }
  }

  // Fetch models list from remote endpoint
  async function handleFetchModels() {
    setFetchingModels(true);
    try {
      const payload: any = {
        baseUrl: baseUrlInput.trim(),
      };
      if (isEditingKey && apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const res = await fetch('/api/admin/models', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.models)) {
        setAvailableModels(data.models);
        if (data.models.length > 0) {
          setConfigMessage({
            type: 'success',
            text: `已从当前端点成功获取 ${data.models.length} 个可用模型，可直接在下方选择！`,
          });
        }
      } else {
        alert(data.message || '获取模型列表失败，请先确认 Base URL 与 API Key 格式无误');
      }
    } catch (err: any) {
      alert(`获取模型列表网络异常: ${err.message}`);
    } finally {
      setFetchingModels(false);
    }
  }

  async function handleTestConnection() {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const payload: any = {
        baseUrl: baseUrlInput.trim(),
        textModel: textModelInput.trim().toLowerCase(),
        imageModel: imageModelInput.trim().toLowerCase(),
      };

      if (isEditingKey && apiKeyInput.trim()) {
        payload.apiKey = apiKeyInput.trim();
      }

      const res = await fetch('/api/admin/config/test', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const messageText = data.message || data.error || (data.success ? '测试成功' : `请求失败 (HTTP ${res.status})`);
      setTestResult({
        success: Boolean(data.success),
        latencyMs: data.latencyMs || 0,
        httpStatus: data.httpStatus || res.status,
        message: messageText,
        reply: data.reply,
        availableModels: data.availableModels,
      });

      if (data.availableModels && Array.isArray(data.availableModels)) {
        setAvailableModels(data.availableModels);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: err.message || '网络连接异常，无法连通后端服务',
      });
    } finally {
      setTestingConnection(false);
    }
  }

  async function loadTasks() {
    try {
      setTasksLoading(true);
      const res = await fetch('/api/admin/tasks', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } finally {
      setTasksLoading(false);
    }
  }

  useEffect(() => {
    if (isLoggedIn && activeTab === 'tasks') {
      let isMounted = true;
      fetch('/api/admin/tasks', { headers: getAuthHeaders() })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (isMounted && data) {
            setTasks(data.tasks || []);
          }
          if (isMounted) setTasksLoading(false);
        })
        .catch(() => {
          if (isMounted) setTasksLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [isLoggedIn, activeTab]);

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span>正在验证管理凭证...</span>
        </div>
      </div>
    );
  }

  // Login View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI 表单助手管理后台</h1>
            <p className="text-xs text-slate-400 mt-2">系统管理凭证受 JWT 与 Bcrypt 严格防护</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">管理员账号</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="请输入管理账号"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">登录密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="请输入登录密码"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>正在验证...</span>
                </>
              ) : (
                <span>立即进入后台</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isKeyMistakenUrl = isEditingKey && (apiKeyInput.startsWith('http://') || apiKeyInput.startsWith('https://'));

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true;
    return t.status === taskFilter;
  });

  // Admin Dashboard View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">AI 填报助手 · 控制中枢</h1>
            <p className="text-xs text-slate-400">大模型路由与自动化日志审计平台</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                大模型配置
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                填报任务日志 ({tasks.length})
              </span>
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>退出</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Form Config */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      多模态大模型对接配置
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      支持所有兼容 OpenAI 规范的推理端点，用于表单语义解析与截图 OCR 理解
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRestoreDefault}
                      className="px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      title="重置为官方推荐默认参数"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>恢复推荐配置</span>
                    </button>
                  </div>
                </div>

                {configMessage && (
                  <div
                    className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2.5 ${
                      configMessage.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                  >
                    {configMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{configMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveConfig} className="space-y-5">
                  {/* Base URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>API Base URL (基准接口地址)</span>
                      <span className="text-[10px] text-slate-500 font-normal">必须为合法 URL，尾部斜杠自动清理</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={baseUrlInput}
                        onChange={(e) => setBaseUrlInput(e.target.value)}
                        required
                        placeholder="https://apihub.agnes-ai.com/v1"
                        className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* API Key */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>API Key (接口密钥)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingKey(!isEditingKey);
                          if (!isEditingKey) {
                            setApiKeyInput('');
                          } else {
                            setApiKeyInput(config?.apiKeyMasked || '');
                          }
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      >
                        {isEditingKey ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>取消重置</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>重新输入新密钥</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={isEditingKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        disabled={!isEditingKey}
                        placeholder={isEditingKey ? '请输入 sk- 开头的完整密钥' : '已持久化加密保护'}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-mono transition-colors ${
                          isKeyMistakenUrl
                            ? 'bg-red-950/40 border-2 border-red-500 text-red-200'
                            : isEditingKey
                            ? 'bg-slate-950 border border-amber-500/50 text-white focus:outline-none'
                            : 'bg-slate-950/40 border border-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    {isKeyMistakenUrl && (
                      <div className="mt-2 p-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>输入内容有误：</strong>检测到您在 API Key 输入框中填写了“网址”！
                          API Key 应该是形如 <code className="text-amber-300">sk-vWM7RHG5n7bljBNi3GgHfygxqiKlUYrPWZLLSUByIGm4BiM9</code> 的密钥字符串。
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-500 mt-1">
                      {isEditingKey
                        ? '注意：保存后旧密钥将被完全覆盖，新密钥仅掩码展示'
                        : '为防止密钥泄露，API Key 仅以掩码展示，保存在数据库中'}
                    </p>
                  </div>

                  {/* Models Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Text Model */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>文本推理模型 (Text Model)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleFetchModels}
                          disabled={fetchingModels}
                          className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                        >
                          <ListOrdered className="w-3 h-3" />
                          <span>{fetchingModels ? '拉取中...' : '从端点获取模型'}</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        value={textModelInput}
                        onChange={(e) => setTextModelInput(e.target.value)}
                        required
                        placeholder="agnes-2.5-flash"
                        className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                      />

                      {availableModels.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] text-slate-400 block mb-1">快速选择端点可用模型：</span>
                          <div className="flex flex-wrap gap-1">
                            {availableModels.map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  setTextModelInput(m);
                                  setImageModelInput(m);
                                }}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                  textModelInput === m
                                    ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image Model */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                        <span>多模态视觉模型 (Image Model)</span>
                      </label>
                      <input
                        type="text"
                        value={imageModelInput}
                        onChange={(e) => setImageModelInput(e.target.value)}
                        required
                        placeholder="agnes-2.5-flash"
                        className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        用于识别页面截图和台账截图表格，推荐与文本模型相同 (如 agnes-2.5-flash)
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={configLoading || isKeyMistakenUrl}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                    >
                      {configLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                      <span>保存大模型配置</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={testingConnection || isKeyMistakenUrl}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 font-medium rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {testingConnection ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <Server className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>测试连接与延迟</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right 1 Col: Test Results & Architecture Guide */}
            <div className="space-y-6">
              {/* Test Result Card */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Server className="w-4 h-4 text-emerald-400" />
                  接口连通性检测
                </h3>

                {testResult ? (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span>{testResult.success ? '连接成功 (HTTP 200)' : '连接失败'}</span>
                      </span>
                      {testResult.latencyMs > 0 && <span>{testResult.latencyMs} ms</span>}
                    </div>

                    <p className="text-slate-300 break-words leading-relaxed whitespace-pre-wrap">
                      {testResult.message}
                    </p>

                    {testResult.reply && (
                      <div className="bg-black/40 p-2.5 rounded-lg text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
                        模型问答心跳: {testResult.reply}
                      </div>
                    )}

                    {!testResult.success && (
                      <div className="pt-2 border-t border-red-500/20">
                        <button
                          type="button"
                          onClick={handleRestoreDefault}
                          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] cursor-pointer"
                        >
                          一键恢复工作正常的推荐配置
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 bg-slate-950/40 p-4 rounded-xl border border-slate-800 leading-relaxed">
                    点击【测试连接与延迟】向配置的 Base URL 与文本模型发送探活心跳，核验 API Key 与通信链路。
                  </p>
                )}
              </div>

              {/* Architecture Info */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
                <h4 className="font-semibold text-slate-200">🛡️ 常见排查提示</h4>
                <ul className="space-y-2 list-disc list-inside text-slate-400 leading-relaxed">
                  <li><strong>API Key 格式</strong>：必须是 sk-xxx 字符串，请勿误填成网址。</li>
                  <li><strong>模型命名规范</strong>：部分提供商区分大小写，Agnes AI 必须全部小写 (如 <code className="text-blue-300">agnes-2.5-flash</code>)。</li>
                  <li><strong>多模态视觉</strong>：<code className="text-blue-300">agnes-2.5-flash</code> 已原生支持图片输入，无需额外配置独立的生图模型。</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">填报审计日志</h2>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                  共 {tasks.length} 次执行
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-800 text-xs">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`px-3 py-1 rounded-lg ${taskFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setTaskFilter('success')}
                    className={`px-3 py-1 rounded-lg ${taskFilter === 'success' ? 'bg-emerald-600/40 text-emerald-300' : 'text-slate-400'}`}
                  >
                    全量成功
                  </button>
                  <button
                    onClick={() => setTaskFilter('partial')}
                    className={`px-3 py-1 rounded-lg ${taskFilter === 'partial' ? 'bg-amber-600/40 text-amber-300' : 'text-slate-400'}`}
                  >
                    部分完成
                  </button>
                  <button
                    onClick={() => setTaskFilter('failed')}
                    className={`px-3 py-1 rounded-lg ${taskFilter === 'failed' ? 'bg-red-600/40 text-red-300' : 'text-slate-400'}`}
                  >
                    异常
                  </button>
                </div>

                <button
                  onClick={loadTasks}
                  disabled={tasksLoading}
                  className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 cursor-pointer"
                  title="刷新日志"
                >
                  <RefreshCw className={`w-4 h-4 ${tasksLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Task list */}
            {filteredTasks.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>暂无符合条件的任务记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((t) => {
                  const isExpanded = expandedTaskId === t.id;
                  return (
                    <div
                      key={t.id}
                      className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-colors hover:border-slate-700"
                    >
                      <div
                        onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {t.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                            {t.status === 'partial' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                            {t.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-sm">
                                {t.excelFileName || '台账记录填报'}
                              </span>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                                第 {t.recordIndex} / {t.totalRecords} 条
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                  t.status === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : t.status === 'partial'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {t.status === 'success' ? '全部填报成功' : t.status === 'partial' ? '部分字段成功' : '执行失败'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                                {t.domain || '目标网页'}
                              </span>
                              <span>·</span>
                              <span>
                                映射 {t.mappedFieldsCount} 项 | 成功: {t.successCount} | 异常: {t.failCount}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(t.timestamp).toLocaleString()}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                          <div className="text-xs font-semibold text-slate-300">字段执行明细：</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {t.details?.map((d, dIdx) => (
                              <div
                                key={dIdx}
                                className={`p-2.5 rounded-xl border flex items-center justify-between ${
                                  d.status === 'success'
                                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                                    : 'bg-red-500/10 border-red-500/20 text-red-300'
                                }`}
                              >
                                <div>
                                  <div className="font-semibold text-white">
                                    {d.sourceField} → {d.targetLabel || d.selector}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[240px]">
                                    填入值: {String(d.sourceValue)}
                                  </div>
                                </div>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                    d.status === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                                  }`}
                                >
                                  {d.status === 'success' ? '成功' : d.error || '失败'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
