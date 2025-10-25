import { useState } from 'react';
import { MenuAnalysisResult, User } from '../types';
import { GeminiService } from '../services/gemini';
import { StorageService } from '../services/storage';

// HTML input要素のcapture属性の型定義を拡張
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    capture?: boolean | 'user' | 'environment';
  }
}

interface Props {
  currentUser: User;
}

export function RecommendMenu({ currentUser }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MenuAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const brands = StorageService.getBrands(currentUser.id);
    if (brands.length === 0) {
      setError('先に好きな銘柄を登録してください');
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);

    // 画像プレビュー
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Base64変換してGeminiに送信
    const base64Reader = new FileReader();
    base64Reader.onload = async (e) => {
      try {
        const base64 = (e.target?.result as string).split(',')[1];
        const analysisResult = await GeminiService.analyzeMenuAndRecommend(base64, brands);
        setResult(analysisResult);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'メニューの解析に失敗しました';
        setError(errorMessage);
        console.error('メニュー解析エラー:', err);
      } finally {
        setLoading(false);
      }
    };
    base64Reader.readAsDataURL(file);
  };

  const FlavorBar = ({ label, value }: { label: string; value: number }) => (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#666' }}>{label}</span>
        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{value}</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${value * 10}%`,
          height: '100%',
          backgroundColor: '#2E5FAC',
          borderRadius: '4px'
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        メニューを撮影
      </h2>

      <div style={{ marginBottom: '30px' }}>
        <label
          htmlFor="image-upload"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: '#2E5FAC',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          📸 画像を選択
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          disabled={loading}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#ffe0e0',
          color: '#d32f2f',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {imagePreview && (
        <div style={{
          marginBottom: '30px',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}>
          <img
            src={imagePreview}
            alt="メニュー"
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain'
            }}
          />
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #2E5FAC',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '16px', color: '#666' }}>メニューを解析しています...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {result && !loading && (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            📋 検出された銘柄
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '30px' }}>
            {result.detectedSakes.map((sake, index) => (
              <span
                key={index}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#E8F0FC',
                  color: '#2E5FAC',
                  fontSize: '14px',
                  borderRadius: '16px',
                  border: '1px solid #2E5FAC'
                }}
              >
                {sake}
              </span>
            ))}
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
            ✨ おすすめの日本酒
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
            {result.recommendations.map((rec, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {rec.name}
                    </h4>
                    {rec.brewery && (
                      <p style={{ fontSize: '14px', color: '#666' }}>{rec.brewery}</p>
                    )}
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}>
                    {rec.matchScore}%
                  </div>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#444',
                  lineHeight: '1.6',
                  marginBottom: '12px'
                }}>
                  {rec.reason}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {rec.characteristics.map((char, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#fff3e0',
                        color: '#f57c00',
                        fontSize: '12px',
                        borderRadius: '12px',
                        border: '1px solid #ffb74d'
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                    味の傾向
                  </h5>
                  <FlavorBar label="甘口度" value={rec.flavorProfile.sweetness} />
                  <FlavorBar label="酸味" value={rec.flavorProfile.acidity} />
                  <FlavorBar label="旨味" value={rec.flavorProfile.umami} />
                  <FlavorBar label="濃醇度" value={rec.flavorProfile.richness} />
                  <FlavorBar label="香り" value={rec.flavorProfile.fragrance} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
              📊 メニュー分析
            </h4>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
              {result.analysisText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
