import { createContext, createSignal, onMount, useContext } from "solid-js";
import { TonConnectUI, TonConnectUiOptions } from '@tonconnect/ui';

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

async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-cache",
      body: JSON.stringify(data),
    });
    return response;
  }
  
export function useTonConnectedWallet() {
    const [connectedWallet, setConnectedWallet] = createSignal<boolean>(false);
    const [tonConnectUI] = useTonConnectUI();
  
    onMount(() => {
      const run = async () => {  
        // enable ui loader
        tonConnectUI.setConnectRequestParameters({ state: 'loading' });
    
        // fetch you tonProofPayload from the backend
        const d = await postData('https://ton-dapp-backend.systemdesigndao.xyz/ton-proof/generatePayload');
        const { payload } = await d.json();
    
        if (!payload) {
            // remove loader, connect request will be without any additional parameters
            tonConnectUI.setConnectRequestParameters(null);
        } else {
            // add tonProof to the connect request
            tonConnectUI.setConnectRequestParameters({
                state: "ready",
                value: { tonProof: payload }
            });
        }
    
        const unsubscribe = tonConnectUI.onStatusChange(
          async wallet => {
            if (!wallet) {
              return;
            }
      
            const tonProof = wallet.connectItems?.tonProof;
      
            if (tonProof) {
              if ('proof' in tonProof) {
                const obj = {
                    proof: {
                      ...tonProof.proof,
                      state_init: wallet.account.walletStateInit,
                    },
                    network: wallet.account.chain,
                    address: wallet.account.address
                };
  
                try {
                  tonConnectUI.setConnectRequestParameters({
                    state: "loading",
                  });
  
                  const d = await postData('https://ton-dapp-backend.systemdesigndao.xyz/ton-proof/checkProof', obj);
                  const { token } = await d.json();
                  const r = await fetch(`https://ton-dapp-backend.systemdesigndao.xyz/dapp/getAccountInfo?network=${obj.network}`, {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          }
                  });
                  const data = await r.json();
      
                  console.log('success: ', data);
  
                  tonConnectUI.setConnectRequestParameters({
                    state: "ready",
                    value: { tonProof: payload }
                  });
  
                  setConnectedWallet(true);
                } catch (err) {
                  console.error(err);
                  
                  setConnectedWallet(false);
                }
              }
            }
          }
        );

        tonConnectUI.connectionRestored.then(restored => {
          if (tonConnectUI.connected) {
            setConnectedWallet(true);

            return;
          }

          if (restored) {
            setConnectedWallet(true);
          } else {
            alert('Connection was not restored.');
          }
      });
  
        return unsubscribe;
      }
  
      run();
    });

    return { connectedWallet };
}

// (react realisation)[https://github.com/ton-connect/sdk/blob/main/packages/ui-react/src/components/TonConnectUIProvider.tsx]