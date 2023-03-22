import './index.css';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { uiIcon } from '../../Maisim/resourceReaders/uiIconReader';
import { Area } from '../../Maisim/areas';

interface Props {
  onPress: (key: string) => void;
}

let timer;
let hasinit = false;

// eslint-disable-next-line import/no-anonymous-default-export
export default forwardRef((props: Props, ref) => {
  const [currentDegree, setcurrentDegree] = useState(0);

  useImperativeHandle(ref, () => ({
    onPress: (key: string) => {
      onPress(key);
      props.onPress(key);
    },
  }));

  useEffect(() => {
    if (!hasinit) {
      console.log(currentDegree);
      timer = setInterval(() => {
        setcurrentDegree(currentDegree => currentDegree + 1);
      }, 16);
      hasinit = true;
    }
  }, []);

  const onPress = (key: string) => {
    // alert(key);

    // alert(123123);
  };

  return (
    <div className="begincontainer">
      <img src={uiIcon.UI_LIB_Window_BG} className="bgi" alt="logo" style={{ rotate: currentDegree * 0.5 + 'deg' }} />
      <img src={uiIcon.mamaDX} className="logoimg" alt="logo" />
      <img src={uiIcon.UI_ADV_Img_PromoChara} className="dxkuma" alt="logo" />

      <div className="tip">
        <p className="beginTip">Maimai Simulator</p>
        <img src={uiIcon.Begin_Tip} className="tipsbg" alt="tip" />
      </div>

      <p className="tip2">某洗衣机的网页模拟器</p>
    </div>
  );
});
