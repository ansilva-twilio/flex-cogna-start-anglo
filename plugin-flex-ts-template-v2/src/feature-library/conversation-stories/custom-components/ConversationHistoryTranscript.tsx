import React, { useEffect, useState } from 'react';
import { Icon } from '@twilio/flex-ui';
import {
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  ChatBubble,
  ChatAttachment,
  ChatAttachmentLink,
  ChatAttachmentDescription,
} from '@twilio-paste/chat-log';

import ConversationHistoryService from '../utils/ConversationHistoryService';

type MessageTrimmed = {
  index: string;
  author: string;
  body: string;
  media: any;
  dateCreated: string;
};

type Media = {
  filename: string;
  content_type: string;
  size?: number;
};

interface ConversationHistoryTranscriptProps {
  conversationSid: string;
}

const ConversationHistoryTranscript: React.FC<ConversationHistoryTranscriptProps> = ({ conversationSid }) => {
  const [messages, setMessages] = useState<MessageTrimmed[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const fetchMessagesRequest = await ConversationHistoryService.fetchConversationMessages(conversationSid);
      setMessages(fetchMessagesRequest?.messages ?? []);
    };

    fetchMessages();
  }, [conversationSid]);

  return (
    <ChatLog>
      {(messages ?? [])?.map((message) => {
        const dateTime: string = message.dateCreated;
        const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        
        if (
          message.author.startsWith('whatsapp:') ||
          message.author.startsWith('+') ||
          uuidPattern.test(message.author) ||
          message.author === 'Virtual Assistant'
        ) {
          return (
            <ChatMessage variant="inbound" key={message.index}>
              <ChatBubble>{message.body}</ChatBubble>
              {(message.media
                ? Array.isArray(JSON.parse(message.media))
                  ? JSON.parse(message.media)
                  : [JSON.parse(message.media)]
                : []
              )?.map((media: any, index: any) => {
                if (!media) {
                  return null;
                }
                try {
                  let filename = media.filename || 'undefined';
                  let content_type = media.content_type || 'undefined';
                  return (
                    <ChatBubble key={index}>
                      <ChatAttachment attachmentIcon={<Icon icon="Whatsapp" />}>
                        <ChatAttachmentLink href="#">{filename}</ChatAttachmentLink>
                        <ChatAttachmentDescription>{content_type}</ChatAttachmentDescription>
                      </ChatAttachment>
                    </ChatBubble>
                  );
                } catch (e) {
                  console.log('ERROR', e);
                  const errorKey = `error-media-${index}`;
                  return (
                    <ChatBubble key={errorKey}>(Não foi possível carregar o arquivo de mídia)</ChatBubble>
                  );
                }
              })}
              <ChatMessageMeta aria-label="customer">
                <ChatMessageMetaItem>
                  {message.author} ・ {dateTime.slice(0, 24)}
                </ChatMessageMetaItem>
              </ChatMessageMeta>
            </ChatMessage>
          );
        } else {
          let author = message.author || '-';
          if (author === conversationSid) {
            author = 'Agente Virtual';
          }

          return (
            <ChatMessage variant="outbound" key={message.index}>
              <ChatBubble>{message.body}</ChatBubble>
              {(message.media
                ? Array.isArray(JSON.parse(message.media))
                  ? JSON.parse(message.media)
                  : [JSON.parse(message.media)]
                : []
              )?.map((media: Media, index: React.Key) => {
                if (!media) {
                  return null;
                }
                try {
                  let filename = media.filename || 'undefined';
                  let content_type = media.content_type || 'undefined';
                  return (
                    <ChatBubble key={index}>
                      <ChatAttachment attachmentIcon={<Icon icon="Whatsapp" />}>
                        <ChatAttachmentLink href="#">{filename}</ChatAttachmentLink>
                        <ChatAttachmentDescription>{content_type}</ChatAttachmentDescription>
                      </ChatAttachment>
                    </ChatBubble>
                  );
                } catch (e) {
                  console.log('ERROR', e);
                  const errorKey = `error-media-${index}`;
                  return (
                    <ChatBubble key={errorKey}>(Não foi possível carregar o arquivo de mídia)</ChatBubble>
                  );
                }
              })}
              <ChatMessageMeta aria-label="agent">
                <ChatMessageMetaItem>
                  {author} ・ {dateTime.slice(0, 24)}
                </ChatMessageMetaItem>
              </ChatMessageMeta>
            </ChatMessage>
          );
        }
      })}
    </ChatLog>
  );
};

export default ConversationHistoryTranscript;
