import React, { useState } from 'react';
import { Upload, FileText, Zap, TrendingUp, Award, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const CVEnhancer = () => {
  const [file, setFile] = useState(null);
  const [cvText, setCvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError('');
    }
  };

  const handleTextInput = (e) => {
    setCvText(e.target.value);
    setError('');
  };

  const analyzeCV = async () => {
  if (!file && !cvText.trim()) {
    setError('Veuillez télécharger un CV ou coller le texte');
    return;
  }

  setLoading(true);
  setError('');

  try {
    const API_URL = 'http://localhost:8000';
    const TOKEN = 'MonMotDePasseSecret123!'; // Doit correspondre à .env backend

    // 1. Si fichier, extraire le texte
    let finalCvText = cvText;
    
    if (file) {
      const formData = new FormData();
      formData.append('cv', file);
      
      const extractRes = await fetch(`${API_URL}/extract`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: formData
      });
      
      if (!extractRes.ok) throw new Error('Extraction failed');
      const extractData = await extractRes.json();
      finalCvText = extractData.cv_text;
    }

    // 2. Optimiser le CV
    const optimizeRes = await fetch(`${API_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ candidate_cv_text: finalCvText })
    });
    
    if (!optimizeRes.ok) throw new Error('Optimization failed');
    const optimizeData = await optimizeRes.json();

    // 3. Analyser les skill gaps
    const skillRes = await fetch(`${API_URL}/skill-gaps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cv_text: finalCvText,
        jd_text: ''
      })
    });
    
    if (!skillRes.ok) throw new Error('Skill analysis failed');
    const skillData = await skillRes.json();

    // Afficher les résultats
    setResults({
      original_score: optimizeData.original_cv_score,
      optimized_score: optimizeData.optimized_cv_score,
      optimized_cv: optimizeData.optimized_cv_text,
      skill_gaps: skillData.skill_gaps
    });
    
    setActiveTab('results');
  } catch (err) {
    setError('Erreur : ' + err.message);
  } finally {
    setLoading(false);
  }
};

  const ScoreCircle = ({ score, label }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            CV Enhancer Pro
          </h1>
          <p className="text-gray-600 text-lg">
            Optimisez votre CV avec l'IA et augmentez vos chances de succès
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-5 h-5 inline-block mr-2" />
              Télécharger CV
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!results}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'results' && results
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline-block mr-2" />
              Résultats
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Télécharger votre CV (PDF, DOCX, TXT)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        {file ? (
                          <p className="text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                            {file.name}
                          </p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 mb-1">
                              Cliquez pour télécharger ou glissez-déposez
                            </p>
                            <p className="text-xs text-gray-400">
                              PDF, DOCX, TXT (Max 10MB)
                            </p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Text Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ou collez le texte de votre CV
                  </label>
                  <textarea
                    value={cvText}
                    onChange={handleTextInput}
                    placeholder="Collez ici le contenu de votre CV..."
                    className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Analyze Button */}
                <button
                  onClick={analyzeCV}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Analyser et Optimiser
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'results' && results && (
              <div className="space-y-8">
                {/* Scores */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Scores de Performance
                  </h2>
                  <div className="flex justify-around items-center">
                    <ScoreCircle score={results.original_score} label="CV Original" />
                    <div className="text-4xl text-gray-300">→</div>
                    <ScoreCircle score={results.optimized_score} label="CV Optimisé" />
                  </div>
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">
                        +{results.optimized_score - results.original_score} points d'amélioration
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optimized CV */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-blue-600" />
                    CV Optimisé
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                      {results.optimized_cv}
                    </pre>
                  </div>
                  <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Télécharger PDF
                  </button>
                </div>

                {/* Skill Gaps */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    Compétences à Développer
                  </h2>
                  <div className="grid gap-4">
                    {results.skill_gaps.map((gap, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow"
                      >
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          {gap.skill}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed ml-10">
                          {gap.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* New Analysis Button */}
                <button
                  onClick={() => {
                    setActiveTab('upload');
                    setResults(null);
                    setFile(null);
                    setCvText('');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Analyser un nouveau CV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Propulsé par l'IA • Données sécurisées • Conforme RGPD</p>
        </div>
      </div>
    </div>
  );
};

export default CVEnhancer;