import { onMount } from 'solid-js';
import { useTonConnectUI } from '../context/TonConnectUI';

const buttonRootId = 'ton-connect2-container';

const TonConnectButton = ({ className, style }: any) => {
    const [_, setOptions] = useTonConnectUI();

    onMount(() => {
        setOptions({ buttonRootId, actionsConfiguration: { twaReturnUrl: 'https://t.me/buymeacoffee_on_ton_bot' } });
        return () => setOptions({ buttonRootId: null });
    });

    return (
        <div
            id={buttonRootId}
            class={className}
            style={{ width: 'fit-content', ...style }}
        ></div>
    );
};

export default TonConnectButton;

// (react realisation)[https://github.com/ton-connect/sdk/blob/main/packages/ui-react/src/components/TonConnectButton.tsx]