import { createContext, createSignal, onMount, useContext } from "solid-js";
import { TonConnectUI, TonConnectUiOptions, Wallet, WalletInfoWithOpenMethod } from '@tonconnect/ui';

const TonConnectUIContext = createContext<null | TonConnectUI>(null);

export function isClientSide(): boolean {
    return typeof window !== 'undefined';
}

export function isServerSide(): boolean {
    return !isClientSide();
}

export function TonConnectUIProvider(props: any) {    
    const [tonConnectUIGet] = createSignal(new TonConnectUI(props));
    const tonConnectUI = tonConnectUIGet();

    return (
        <TonConnectUIContext.Provider value={tonConnectUI}>
            {props.children}
        </TonConnectUIContext.Provider>
    );
}

export function useTonConnectUI(): [TonConnectUI, (options: TonConnectUiOptions) => void] {
    const tonConnectUI = useContext(TonConnectUIContext);

    const setOptions = 
        (options: TonConnectUiOptions) => {
            if (tonConnectUI) {
                tonConnectUI!.uiOptions = options;
            }
        }

    if (isServerSide()) {
        return [null as unknown as TonConnectUI, () => {}];
    }

    return [tonConnectUI!, setOptions];
}

export function useTonConnectedWallet() {
    const [tonConnectUI] = useTonConnectUI();
    const [wallet, setWallet] = createSignal<Wallet | (Wallet & WalletInfoWithOpenMethod) | null>(
      null
    );
    const [restored, setRestored] = createSignal(false);
  
    onMount(() => {
      const run = async () => {
        if (tonConnectUI) {
          tonConnectUI.connectionRestored.then(() => setRestored(true));

          return tonConnectUI.onStatusChange(wallet => {
            setWallet(wallet);
          });
        }
      }
  
      run();
    });

    return { wallet, restored };
}

// (react realisation)[https://github.com/ton-connect/sdk/blob/main/packages/ui-react/src/components/TonConnectUIProvider.tsx]