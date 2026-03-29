import { expect } from 'chai';
import template from '../../../resources/element-templates/openai-connector.json';

describe('OpenAI Connector Element Template', function() {
  
  describe('Template Structure', function() {
    
    it('should load template successfully', function() {
      expect(template).to.exist;
      expect(template).to.be.an('array');
      expect(template).to.have.lengthOf(1);
    });

    it('should have correct template id', function() {
      expect(template[0].id).to.equal('org.fluxnova.connectors.OpenAI');
    });

    it('should have correct template name', function() {
      expect(template[0].name).to.equal('OpenAI Chat Completions');
    });

    it('should apply to ServiceTask', function() {
      expect(template[0].appliesTo).to.include('bpmn:ServiceTask');
    });

    it('should have all property groups', function() {
      const groupIds = template[0].groups.map(g => g.id);
      expect(groupIds).to.include('authentication');
      expect(groupIds).to.include('input');
      expect(groupIds).to.include('model');
      expect(groupIds).to.include('advanced');
      expect(groupIds).to.include('output');
    });

  });

  describe('Required Properties', function() {
    
    it('should have API key property', function() {
      const apiKeyProp = template[0].properties.find(p => p.binding.name === 'apiKey');
      expect(apiKeyProp).to.exist;
      expect(apiKeyProp.constraints.notEmpty).to.be.true;
    });

    it('should require valid API key format', function() {
      const apiKeyProp = template[0].properties.find(p => p.binding.name === 'apiKey');
      const pattern = new RegExp(apiKeyProp.constraints.pattern.value);
      
      expect(pattern.test('sk-proj-abc123def456ghi789')).to.be.true;
      expect(pattern.test('${secrets.openaiKey}')).to.be.true;
      expect(pattern.test('invalid-key')).to.be.false;
      expect(pattern.test('sk-')).to.be.false;
    });

    it('should have user message property', function() {
      const userMsgProp = template[0].properties.find(p => p.binding.name === 'userMessage');
      expect(userMsgProp).to.exist;
      expect(userMsgProp.type).to.equal('Text');
      expect(userMsgProp.constraints.notEmpty).to.be.true;
    });

    it('should have response content property', function() {
      const responseProp = template[0].properties.find(p => p.binding.name === 'content');
      expect(responseProp).to.exist;
      expect(responseProp.group).to.equal('output');
    });

  });

  describe('Optional Properties', function() {
    
    it('should have model property as open-ended string', function() {
      const modelProp = template[0].properties.find(p => p.binding.name === 'model');
      expect(modelProp).to.exist;
      expect(modelProp.type).to.equal('String');
      expect(modelProp.value).to.equal('gpt-3.5-turbo');
      expect(modelProp.optional).to.be.undefined; // Not marked optional, has default
    });

    it('should validate model identifier format', function() {
      const modelProp = template[0].properties.find(p => p.binding.name === 'model');
      const pattern = new RegExp(modelProp.constraints.pattern.value);
      
      expect(pattern.test('gpt-3.5-turbo')).to.be.true;
      expect(pattern.test('gpt-4-turbo')).to.be.true;
      expect(pattern.test('${modelName}')).to.be.true;
      expect(pattern.test('mistral')).to.be.true;
      expect(pattern.test('llama2')).to.be.true;
      expect(pattern.test('invalid model name')).to.be.false; // spaces not allowed
    });

    it('should have temperature property with validation', function() {
      const tempProp = template[0].properties.find(p => p.binding.name === 'temperature');
      expect(tempProp).to.exist;
      expect(tempProp.optional).to.be.true;
      expect(tempProp.value).to.equal('1.0');
      expect(tempProp.constraints.pattern).to.exist;
    });

    it('should validate temperature range', function() {
      const tempProp = template[0].properties.find(p => p.binding.name === 'temperature');
      const pattern = new RegExp(tempProp.constraints.pattern.value);
      
      expect(pattern.test('0.0')).to.be.true;
      expect(pattern.test('0.7')).to.be.true;
      expect(pattern.test('1.0')).to.be.true;
      expect(pattern.test('2.0')).to.be.true;
      expect(pattern.test('${temperature}')).to.be.true;
      expect(pattern.test('2.5')).to.be.false;
      expect(pattern.test('-0.1')).to.be.false;
    });

    it('should have max tokens property', function() {
      const maxTokensProp = template[0].properties.find(p => p.binding.name === 'maxTokens');
      expect(maxTokensProp).to.exist;
      expect(maxTokensProp.optional).to.be.true;
      expect(maxTokensProp.type).to.equal('String');
    });

    it('should validate max tokens as positive integer', function() {
      const maxTokensProp = template[0].properties.find(p => p.binding.name === 'maxTokens');
      const pattern = new RegExp(maxTokensProp.constraints.pattern.value);
      
      expect(pattern.test('100')).to.be.true;
      expect(pattern.test('4096')).to.be.true;
      expect(pattern.test('${maxTokens}')).to.be.true;
      expect(pattern.test('0')).to.be.false;
      expect(pattern.test('-100')).to.be.false;
      expect(pattern.test('abc')).to.be.false;
    });

    it('should have system message property', function() {
      const sysMsgProp = template[0].properties.find(p => p.binding.name === 'systemMessage');
      expect(sysMsgProp).to.exist;
      expect(sysMsgProp.optional).to.be.true;
      expect(sysMsgProp.type).to.equal('Text');
    });

    it('should have conversation history property', function() {
      const historyProp = template[0].properties.find(p => p.binding.name === 'messages');
      expect(historyProp).to.exist;
      expect(historyProp.optional).to.be.true;
      expect(historyProp.type).to.equal('Text');
    });

    it('should have advanced parameters', function() {
      const topPProp = template[0].properties.find(p => p.binding.name === 'topP');
      const presenceProp = template[0].properties.find(p => p.binding.name === 'presencePenalty');
      const frequencyProp = template[0].properties.find(p => p.binding.name === 'frequencyPenalty');
      const stopProp = template[0].properties.find(p => p.binding.name === 'stop');
      const userProp = template[0].properties.find(p => p.binding.name === 'user');
      
      expect(topPProp).to.exist;
      expect(presenceProp).to.exist;
      expect(frequencyProp).to.exist;
      expect(stopProp).to.exist;
      expect(userProp).to.exist;
      
      // All should be in advanced group
      expect(topPProp.group).to.equal('advanced');
      expect(presenceProp.group).to.equal('advanced');
      expect(frequencyProp.group).to.equal('advanced');
      expect(stopProp.group).to.equal('advanced');
      expect(userProp.group).to.equal('advanced');
    });

  });

  describe('Output Mapping', function() {
    
    it('should have response content output parameter', function() {
      const contentOutput = template[0].properties.find(
        p => p.binding.type === 'camunda:outputParameter' && 
             p.binding.source === '${content}'
      );
      expect(contentOutput).to.exist;
      expect(contentOutput.group).to.equal('output');
      expect(contentOutput.value).to.equal('aiResponse');
    });

    it('should have optional token usage output parameter', function() {
      const tokenOutput = template[0].properties.find(
        p => p.binding.type === 'camunda:outputParameter' && 
             p.binding.source === '${usage}'
      );
      expect(tokenOutput).to.exist;
      expect(tokenOutput.optional).to.be.true;
      expect(tokenOutput.value).to.equal('tokenUsage');
    });

    it('should have optional full response output parameter', function() {
      const fullOutput = template[0].properties.find(
        p => p.binding.type === 'camunda:outputParameter' && 
             p.binding.source === '${response}'
      );
      expect(fullOutput).to.exist;
      expect(fullOutput.optional).to.be.true;
    });

  });

  describe('Descriptions and Help Text', function() {
    
    it('should have helpful descriptions for all properties', function() {
      const requiredProps = ['apiKey', 'userMessage'];
      
      requiredProps.forEach(propName => {
        const prop = template[0].properties.find(p => p.binding.name === propName);
        expect(prop.description).to.exist;
        expect(prop.description.length).to.be.greaterThan(10);
      });
    });

    it('should indicate required fields in descriptions', function() {
      const apiKeyProp = template[0].properties.find(p => p.binding.name === 'apiKey');
      expect(apiKeyProp.description.toLowerCase()).to.include('require');
    });

  });

  describe('API Endpoint Override', function() {
    
    it('should allow API endpoint override', function() {
      const endpointProp = template[0].properties.find(p => p.binding.name === 'apiEndpoint');
      expect(endpointProp).to.exist;
      expect(endpointProp.optional).to.be.true;
      expect(endpointProp.value).to.equal('https://api.openai.com/v1');
    });

    it('should support Azure OpenAI endpoints', function() {
      const endpointProp = template[0].properties.find(p => p.binding.name === 'apiEndpoint');
      expect(endpointProp.description).to.include('Azure OpenAI');
      expect(endpointProp.description).to.include('local models');
    });

  });

});
