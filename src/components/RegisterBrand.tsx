import { useState, useEffect } from 'react';
import { SakeBrand, User } from '../types';
import { GeminiService } from '../services/gemini';
import { StorageService } from '../services/storage';

interface Props {
  onBrandAdded: () => void;
  currentUser: User;
}

export function RegisterBrand({ onBrandAdded, currentUser }: Props) {
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<SakeBrand[]>([]);

  useEffect(() => {
    setBrands(StorageService.getBrands(currentUser.id));
  }, [currentUser.id]);

  const handleRegister = async () => {
    if (!brandName.trim()) {
      setError('銘柄名を入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await GeminiService.analyzeSakeBrand(brandName);

      const newBrand: SakeBrand = {
        userId: currentUser.id,
        id: Date.now().toString(),
        name: analysis.identifiedName,
        brewery: analysis.brewery,
        region: analysis.region,
        flavorProfile: analysis.flavorProfile,
        createdAt: Date.now()
      };

      StorageService.addBrand(newBrand);
      setBrands(StorageService.getBrands(currentUser.id));
      setBrandName('');
      onBrandAdded();
    } catch (err) {
      setError('銘柄の登録に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この銘柄を削除しますか？')) {
      StorageService.deleteBrand(id);
      setBrands(StorageService.getBrands());
      onBrandAdded();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        好きな銘柄を登録
      </h2>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="銘柄名を入力（例：獺祭）"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              backgroundColor: loading ? '#ccc' : '#2E5FAC',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </div>
        {error && <p style={{ color: '#ff4444', fontSize: '14px' }}>{error}</p>}
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
        登録済み銘柄 ({brands.length})
      </h3>

      {brands.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
          銘柄が登録されていません。
          <br />
          上の入力欄から登録してください。
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {brands.map((brand) => (
            <div
              key={brand.id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {brand.name}
                  </h4>
                  {brand.brewery && (
                    <p style={{ fontSize: '14px', color: '#666' }}>{brand.brewery}</p>
                  )}
                  {brand.region && (
                    <p style={{ fontSize: '14px', color: '#666' }}>{brand.region}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(brand.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: '#ff4444',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    height: 'fit-content'
                  }}
                >
                  削除
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px'
                }}>
                  甘口: {brand.flavorProfile.sweetness}
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px'
                }}>
                  酸味: {brand.flavorProfile.acidity}
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px'
                }}>
                  旨味: {brand.flavorProfile.umami}
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px'
                }}>
                  濃醇: {brand.flavorProfile.richness}
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px'
                }}>
                  香り: {brand.flavorProfile.fragrance}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
