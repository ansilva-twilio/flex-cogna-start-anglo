import React, { useEffect, useState } from 'react';
import { Icon } from '@twilio/flex-ui';
import { Box } from '@twilio-paste/core/box';
import { Text } from '@twilio-paste/core/text';
import { Disclosure, DisclosureHeading, DisclosureContent } from '@twilio-paste/core/disclosure';
import { Spinner } from '@twilio-paste/core/spinner';

import ConversationHistoryService from '../utils/ConversationHistoryService';
import ConversationHistoryTranscript from './ConversationHistoryTranscript';

type ConversationTrimmed = {
  conversationSid: string;
  conversationDateCreated: string;
  conversationOriginalChannel: string;
  conversationState: string;
};

interface ConversationHistoryListProps {
  phoneNumber: string;
}

const ConversationHistoryList: React.FC<ConversationHistoryListProps> = ({ phoneNumber }) => {
  const [conversations, setConversations] = useState<ConversationTrimmed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await ConversationHistoryService.fetchConversationsByParticipant(phoneNumber);
        setConversations(response.conversations);
      } catch (err) {
        setError('Erro ao buscar conversas. Verifique o número e tente novamente.');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (phoneNumber) {
      fetchConversations();
    }
  }, [phoneNumber]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding="space100">
        <Spinner decorative={false} title="Carregando conversas..." size="sizeIcon110" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding="space60">
        <Text as="p" color="colorTextError">
          {error}
        </Text>
      </Box>
    );
  }

  if (conversations.length === 0) {
    return (
      <Box padding="space60">
        <Text as="p" color="colorTextWeak">
          Nenhuma conversa encontrada para este número.
        </Text>
      </Box>
    );
  }

  return (
    <Box padding="space20" width="100%">
      {conversations.map((conversation, index) => {
        const dateTime: string = conversation.conversationDateCreated;
        
        let channelIcon;
        switch (conversation.conversationOriginalChannel) {
          case 'whatsapp':
            channelIcon = <Icon icon="Whatsapp" />;
            break;
          case 'sms':
            channelIcon = <Icon icon="Sms" />;
            break;
          default:
            channelIcon = <Icon icon="Message" />;
        }

        return (
          <Disclosure key={conversation.conversationSid}>
            <DisclosureHeading as="h2" variant="heading50">
              {channelIcon} {dateTime.slice(0, 24)}{' '}
              <Text color="colorTextWeak" fontSize="fontSize20" marginRight="space30" as="span">
                ({conversation.conversationState})
              </Text>
            </DisclosureHeading>
            <DisclosureContent key={index}>
              <ConversationHistoryTranscript conversationSid={conversation.conversationSid} />
            </DisclosureContent>
          </Disclosure>
        );
      })}
    </Box>
  );
};

export default ConversationHistoryList;
