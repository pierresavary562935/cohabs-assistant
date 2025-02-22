import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
} from 'rsuite';
import Gear from '@rsuite/icons/Gear';
import { toast, ToastContainer } from 'react-toastify';
import 'rsuite/dist/rsuite.min.css';
import 'react-toastify/dist/ReactToastify.css';
import translations from './translations';
import ApiKeyComponent from './components/ApiKeyComponent';

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
    console.log('fetching server status and availabilities');
    fetchServerStatus();
    fetchAvailabilities();

    setUserApiKey(localStorage.getItem('userApiKey') || '');
  }, []);

  useEffect(() => {
    // auto scroll to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // call server status
  const fetchServerStatus = async () => {
    try {
      const response = await axios.get('/api/status');
      setServerStatus(response.data.message);
    } catch (err) {
      setServerStatus(t.serverError);
    }
  };

  // call openai
  const fetchOpenAi = async (user_prompt: string) => {
    try {
      const languagePrompts: Record<Language, string> = {
        fr: `Voici l'historique de la conversation:\n${chatHistory.map((msg) => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`).join('\n')}.
            Voici les disponibilités actuelles:\n${availabilities.map((availability) => '🏠 Maison: ' + availability.houseName + '\n🛏️ Chambres disponibles: ' + availability.availableRooms + 'Ville: ' + availability.city + 'Adresse: ' + availability.address).join('\n')}.
            \n\nMessage utilisateur: ${user_prompt}\n\nRéponse:`,
        en: `Here is the conversation history:\n${chatHistory.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}.
            Here are the current availabilities:\n${availabilities.map((availability) => '🏠 House: ' + availability.houseName + '\n🛏️ Available rooms: ' + availability.availableRooms + 'City: ' + availability.city + 'Address: ' + availability.address).join('\n')}.
            \n\nUser message: ${user_prompt}\n\nResponse:`,
        nl: `Hier is de gespreksgeschiedenis:\n${chatHistory.map((msg) => `${msg.role === 'user' ? 'Gebruiker' : 'Assistent'}: ${msg.content}`).join('\n')}.
            Hier zijn de huidige beschikbaarheden:\n${availabilities.map((availability) => '🏠 Huis: ' + availability.houseName + '\n🛏️ Beschikbare kamers: ' + availability.availableRooms + 'Stad: ' + availability.city + 'Adres: ' + availability.address).join('\n')}.
            \n\nGebruikersbericht: ${user_prompt}\n\nReactie:`,
      };

      const finalPrompt = languagePrompts[language];

      const response = await axios.post(
        '/api/openai',
        { prompt: finalPrompt },
        {
          headers: {
            'Authorization': `Bearer ${userApiKey}`,
          },
        }
      );
      return response.data.response;
    } catch (err) {
      return t.serverError;
    }
  };

  const fetchAvailabilities = async () => {
    try {
      const response = await axios.get('/api/availabilities');
      const availabilities = response.data;
      setAvailabilities(availabilities);
    }
    catch (err) {
      toast.error(t.availabilityError, toastOptions);
    }
  };

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

    const responseText = await fetchOpenAi(prompt);
    setChatHistory([...newChatHistory, { role: 'assistant', content: responseText }]);


    setLoading(false);
  };

  return (
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
  );
};

export default App;