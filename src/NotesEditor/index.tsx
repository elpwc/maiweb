import { useEffect, useState } from 'react';
import './index.css';

interface Props {
  notes: string;
  onEdit: (notes: string) => void;
  onPlay: () => void;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (props: Props) => {
  const [currentnotes, setcurrentnotes]: [string, any] = useState('');

  useEffect(() => {
    setcurrentnotes(props.notes);
  }, [props.notes]);

  return (
    <>
      <div style={{ minHeight: '500px', height: 'fit-content' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => {
              props.onEdit(currentnotes);
            }}
          >
            保存
          </button>
          <button>搜索音乐/pv</button>
          <button>添加音乐</button>
          <button>添加PV</button>
          <button
            onClick={() => {
              props.onPlay();
            }}
          >
            播放
          </button>
          <button>归位</button>
          <button>发布</button>
        </div>
        <details>
          <summary>添加谱面详细信息</summary>
        </details>
        <textarea
          title=""
          placeholder=""
          style={{ width: '100%', height: '100%' }}
          value={currentnotes}
          onChange={e => {
            setcurrentnotes(e.target.value);
          }}
        />
      </div>
    </>
  );
};
