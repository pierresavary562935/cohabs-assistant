import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Input,
  Panel,
  Message,
  Loader,
  Stack,
  Avatar,
  FlexboxGrid,
  RadioGroup,
  Radio,
  CustomProvider,
  IconButton,
} from 'rsuite';
import Gear from '@rsuite/icons/Gear';
import { toast, ToastContainer } from 'react-toastify';
import 'rsuite/dist/rsuite.min.css';
import 'react-toastify/dist/ReactToastify.css';
import translations from './translations';
import ApiKeyComponent from './components/ApiKeyComponent';
import { fetchAvailabilities, fetchOpenAi, fetchServerStatus } from './api/express-server';
import { MdOutlineNightlight, MdOutlineLightMode } from 'react-icons/md';
import Icon from '@rsuite/icons/esm/Icon';

type Language = 'fr' | 'en' | 'nl';
interface Availability {
  houseName: string;
  availableRooms: number;
  city: string;
  address: string;
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [serverStatus, setServerStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>('fr');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const t = translations[language];

  // API key vars
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  const toastOptions = {
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  useEffect(() => {
    initializeData();
    setUserApiKey(localStorage.getItem('userApiKey') || '');
  }, []);

  const initializeData = async () => {
    try {
      const status = await fetchServerStatus();
      setServerStatus(status);

      const availabilityData = await fetchAvailabilities();
      setAvailabilities(availabilityData);
    } catch (err) {
      toast.error(t.serverError, toastOptions);
    }
  };

  useEffect(() => {
    // auto scroll to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // handle special commands
  const handleSpecialCommand = async (command: string) => {
    if (command === '/availability') {
      try {
        let newMessages = [{ role: 'assistant', content: t.availabilitiesTitle }];

        availabilities.forEach((availability: any) => {
          newMessages.push({
            role: 'assistant',
            content: `🏠 ${t.house}: ${availability.houseName}\n🛏️ ${t.availableRooms}: ${availability.availableRooms}\n`
          });
        });

        newMessages.push({ role: 'assistant', content: t.needMoreInfo });
        setChatHistory((prevHistory) => [...prevHistory, ...newMessages]);

      } catch (err) {
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { role: 'assistant', content: t.availabilityError },
        ]);
      }
    } else {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: 'assistant', content: t.unknownCommand },
      ]);
    }
  };

  const handleButtonClick = async () => {
    setLoading(true);

    if (!prompt) {
      toast.error(t.emptyPrompt, toastOptions);
      setLoading(false);
      return;
    }

    if (!userApiKey) {
      toast.error(t.noApiKeys, toastOptions);
      setShowApiKeyModal(true);
      setLoading(false);
      return;
    }

    setPrompt('');

    const newChatHistory = [...chatHistory, { role: 'user', content: prompt }];
    setChatHistory(newChatHistory);

    // specal commands
    if (prompt.startsWith('/')) {
      await handleSpecialCommand(prompt);
      setPrompt('');
      setLoading(false);
      return;
    }

    try {
      const responseText = await fetchOpenAi(prompt, newChatHistory, availabilities, language, userApiKey);
      setChatHistory([...newChatHistory, { role: 'assistant', content: responseText }]);
    } catch (err) {
      toast.error(t.serverError, toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (

    <CustomProvider theme={theme}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <ToastContainer position="top-center" theme="dark" />

        {/* server status */}
        <Panel bordered style={{ marginBottom: 20 }}>
          <h1>Cohabs Assistant</h1>
          <FlexboxGrid justify="space-between">
            <FlexboxGrid.Item>
              <p>{t.serverStatus}: {serverStatus}</p>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item>
              <RadioGroup inline appearance="picker" value={language} onChange={(value) => setLanguage(value as Language)}>
                <Radio value="fr">Français</Radio>
                <Radio value="en">English</Radio>
                <Radio value="nl">Nederlands</Radio>
              </RadioGroup>
              <Button size="sm" appearance="primary" onClick={() => setShowApiKeyModal(true)} style={{ marginLeft: 10 }}>
                <Gear style={{ marginRight: 5 }} /> API Key
              </Button>
              <IconButton
                icon={
                  <Icon
                    as={theme === 'light' ? MdOutlineNightlight as any : MdOutlineLightMode as any}
                    style={{ fontSize: 20 }}
                  />
                }
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              />
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Panel>

        {/* chat */}
        <Panel bordered style={{ height: 400, overflowY: 'auto', marginBottom: 20 }} ref={chatContainerRef}>
          {chatHistory.length === 0 ? (
            <Message type="info">{t.startChat}</Message>
          ) : (
            chatHistory.map((msg, index) => (
              <FlexboxGrid key={index} justify={msg.role === 'user' ? 'end' : 'start'} style={{ marginBottom: 10 }}>
                <FlexboxGrid.Item colspan={24}>
                  <Stack spacing={10} style={{ justifyContent: msg.role === 'user' ? 'end' : 'start' }}>
                    {msg.role === 'assistant' && <Avatar circle size="sm" alt="AI" />}
                    <Message type={msg.role === 'user' ? 'info' as any : 'success' as any}>
                      {msg.content.split('\n').map((line, index) => <p key={index}>{line}</p>)}
                    </Message>
                    {msg.role === 'user' && <Avatar circle size="sm" alt="U" />}
                  </Stack>

                </FlexboxGrid.Item>
              </FlexboxGrid>
            ))
          )}

          {loading && (
            <Stack justifyContent="center" style={{ margin: '20px 0' }}>
              <Loader size="md" content={t.loadingResponse} />
            </Stack>
          )}

        </Panel>

        {/* textarea + btn */}
        <Panel bordered style={{ marginBottom: 20 }}>
          <Input
            as="textarea"
            rows={3}
            placeholder={t.enterMessage}
            value={prompt}
            onChange={(value) => setPrompt(value)}
            style={{ marginBottom: 10 }}
          />
          <Button appearance="primary" loading={loading} block onClick={handleButtonClick}>
            {loading ? t.sending : t.send}
          </Button>
        </Panel>

        <ApiKeyComponent setShow={setShowApiKeyModal} show={showApiKeyModal} userApiKey={userApiKey} setUserApiKey={setUserApiKey} />
      </div>
    </CustomProvider>
  );
};

export default App;