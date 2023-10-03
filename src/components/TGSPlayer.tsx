import { onCleanup, onMount, createSignal } from 'solid-js';
import lottie from 'lottie-web';
import pako from 'pako';

type ITGSPlayer = {
  tgsPath: string;
  className?: string;
}

export function TGSPlayer(props: ITGSPlayer) {
  let container: any;
  let animation: any;

  const [isHovered, setIsHovered] = createSignal(false);

  onMount(async () => {
    const response = await fetch(props.tgsPath);
    const tgsData = await response.arrayBuffer();
    
    const decompressedData = pako.inflate(new Uint8Array(tgsData), { to: 'string' });
    const lottieJson = JSON.parse(decompressedData);

    animation = lottie.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: lottieJson,
      initialSegment: [0, 180]
    });

    animation.addEventListener('complete', () => {
      if (isHovered()) {
        animation.playSegments([0, 180], true);
      } else {
        animation.setDirection(1);
        animation.setSpeed(1);
        animation.goToAndStop(0, true);
      }
    });

    onCleanup(() => {
      animation.destroy();
    });
  });

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (animation) {
      animation.setDirection(1);
      animation.setSpeed(1);
      animation.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (animation) {
      animation.setDirection(-1);
      animation.setSpeed(1);
      animation.play();
    }
  };

  return (
    <div
      ref={container}
      class={props.className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    ></div>
  );
}