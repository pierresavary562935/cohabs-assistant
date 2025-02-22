import { useEffect } from "react";
import { Button, FlexboxGrid, Input, Modal, Panel } from "rsuite";

export default function ApiKeyComponent({ setShow, show, setUserApiKey, userApiKey }: { setShow: (show: boolean) => void; show: boolean; setUserApiKey: (key: string) => void; userApiKey: string }) {

    useEffect(() => {
        if (userApiKey !== '') {
            localStorage.setItem('userApiKey', userApiKey);
            setShow(false);
        }
    }, [userApiKey, setShow]);

    return (
        <>
            <Modal open={show} size="xs" onClose={() => setShow(false)} closeButton={false}>
                <Modal.Header>
                    <Modal.Title>API Key</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel bordered>
                        {userApiKey ? (
                            <>
                                <p>
                                    Your API key is set. If you want to change it, please clear it first.
                                </p>
                                <Input
                                    placeholder="sk-..."
                                    value={userApiKey}
                                    disabled
                                    style={{ marginBottom: 10 }}
                                />
                                <Button appearance="primary" onClick={() => setUserApiKey('')}>
                                    Clear
                                </Button>
                                <Button appearance="subtle" onClick={() => setShow(false)} style={{ marginLeft: 10 }}>
                                    Close
                                </Button>
                            </>
                        ) : (
                            <>
                                <p>Please provide your OpenAI API key :</p>
                                <Input

                                    placeholder="sk-..."
                                    value={userApiKey}
                                    onChange={(value) => setUserApiKey(value)}
                                    style={{ marginBottom: 10 }}
                                />
                            </>
                        )}
                    </Panel>
                </Modal.Body>
            </Modal>
        </>
    );
}
