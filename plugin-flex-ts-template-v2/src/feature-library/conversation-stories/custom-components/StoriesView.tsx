import React, { useState } from 'react';
import { Template } from '@twilio/flex-ui';
import { Flex } from '@twilio-paste/core/flex';
import { Heading } from '@twilio-paste/core/heading';
import { Box } from '@twilio-paste/core/box';
import { Input } from '@twilio-paste/core/input';
import { Label } from '@twilio-paste/core/label';
import { Button } from '@twilio-paste/core/button';

import ConversationHistoryList from './ConversationHistoryList';

const StoriesView = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchNumber, setSearchNumber] = useState('');

  const handleSearch = () => {
    setSearchNumber(phoneNumber);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Flex element="STORIES_VIEW_WRAPPER" vertical grow shrink>
      <Heading as="h1" variant="heading30">
        Histórico de Conversas
      </Heading>
      <Box width="100%" padding="space60">
        <Box marginBottom="space60">
          <Label htmlFor="phone-search">Número de Telefone ou WhatsApp</Label>
          <Flex hAlignContent="left" vAlignContent="center">
            <Box flexGrow={1} marginRight="space40">
              <Input
                id="phone-search"
                type="text"
                placeholder="+5511999999999 ou whatsapp:+5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </Box>
            <Button variant="primary" onClick={handleSearch}>
              Buscar
            </Button>
          </Flex>
        </Box>
        {searchNumber && <ConversationHistoryList phoneNumber={searchNumber} />}
      </Box>
    </Flex>
  );
};

export default StoriesView;
