# OpenAI Chat Completions Connector - Quick Start

**Element Template ID**: `org.fluxnova.connectors.OpenAI`  
**Latest Version**: 1.0  
**Platforms**: Fluxnova 5.30.0+, Camunda 8.x

---

## 30 Second Setup

1. **Create a Service Task** in your BPMN diagram
2. **Configure Properties**:
   - API Key: `${secrets.openaiKey}` (or hardcoded key for testing)
   - User Message: `What is the capital of France?`
   - Response Content: `aiResponse`
3. **Access Output**: Process variable `${aiResponse}` contains the AI response

---

## Required Configuration

### API Key (Required)
- **Format**: OpenAI API key starting with `sk-` (20+ characters)
- **Security**: Use process variables instead of hardcoding
- **Example**: `${secrets.openaiKey}`

### User Message (Required)
- **What**: The prompt/question for the AI
- **Example**: `"Summarize this text: ${documentContent}"`
- **Supports**: Process variables with `${variableName}` syntax

### Response Content (Required - Output)
- **What**: Variable name to store the response
- **Example**: `aiResponse`
- **Auto-populated**: Default value is `aiResponse`

---

## Optional Configuration

### Model (default: gpt-3.5-turbo)
- **Fast & Cheap**: `gpt-3.5-turbo` (recommended for cost efficiency)
- **Capable**: `gpt-4`, `gpt-4-turbo`, `gpt-4o`
- **Azure OpenAI**: Use custom deployment names or `gpt-35-turbo`
- **Local Models**: `llama2`, `mistral`, or other ollama/vLLM models

### System Message
- **What**: Instructions for the AI's behavior
- **Example**: `"You are a helpful business analyst. Answer questions professionally."`
- **Impact**: Influences AI personality and response style

### Temperature (0.0 - 2.0, default: 1.0)
- **0.0-0.5**: Deterministic, factual responses (good for Q&A, summarization)
- **0.7-1.0**: Balanced creativity (good for general use)
- **1.5-2.0**: Creative, random responses (good for brainstorming)

### Max Tokens
- **What**: Maximum length of response in tokens
- **Example**: `500` (limits response length)
- **Note**: Leave empty to use model's default limit

### Advanced Parameters
- **Conversation History**: JSON array of previous messages for multi-turn conversations
- **Top P**: Nucleus sampling (0.0-1.0) - alternative to temperature
- **Stop Sequences**: Custom stop points (JSON array, e.g., `["STOP", "\n\n"]`)
- **Presence/Frequency Penalty**: Encourage new topics or reduce repetition (-2.0 to 2.0)

---

## Common Examples

### Example 1: Simple Q&A

**Properties**:
```
User Message: What are the top 3 benefits of business process automation?
Response Content: aiResponse
```

**Access Result**:
```
${aiResponse}
```

### Example 2: Multi-Turn Conversation

**First Message**:
```
System Message: You are a helpful customer service agent.
User Message: ${firstCustomerQuestion}
Response Content: assistantReply
Model: gpt-4
```

**Subsequent Messages**:
```
System Message: You are a helpful customer service agent.
Conversation History: ${conversationHistory}
User Message: ${nextCustomerQuestion}
Response Content: assistantReply
```

**Update History** (after receiving response):
```
BPMN Expression:
${conversationHistory.append({
  "role": "user",
  "content": nextCustomerQuestion
}).append({
  "role": "assistant",
  "content": assistantReply
})}
```

### Example 3: Document Analysis

**Properties**:
```
System Message: You are a document analysis expert. Extract key information and provide insights.
User Message: Analyze this invoice: ${invoiceData}
Max Tokens: 1000
Temperature: 0.3
Response Content: analysisResult
```

### Example 4: Error Handling with Retries

**Boundary Event (Error)**:
```
Error Type: OpenAI API Error
Catch Escalation: true
```

**Retry Logic**:
- Use timer boundary event with "Retry" label
- Increment retry counter: `${retryCount + 1}`
- Exit after 3 retries

**Example Gateway**:
```
Condition: ${retryCount < 3}
  → Yes: Retry task
  → No: Log error and continue
```

---

## Best Practices

✅ **DO**:
- Use `${secrets.openaiKey}` pattern for API keys
- Start with `gpt-3.5-turbo` (cheapest, often sufficient)
- Set `maxTokens` to prevent unexpectedly long responses
- Implement retry logic with boundary events
- Monitor token usage (stored in `${tokenUsage}`)
- Use `temperature: 0.3-0.5` for factual tasks

❌ **DON'T**:
- Hardcode API keys in BPMN diagrams
- Use expensive models without considering cost impact
- Send raw documents without summarization
- Ignore error handling (API calls can fail)
- Use high temperatures (>1.5) for factual tasks

---

## Cost Considerations

### Model Costs (Approximate as of Feb 2026)

| Model | Input Cost | Output Cost | Context | Best For |
|-------|-----------|-----------|---------|----------|
| `gpt-3.5-turbo` | $0.50/M | $1.50/M | 16K | General purpose |
| `gpt-4` | $30/M | $60/M | 8K | Complex tasks |
| `gpt-4-turbo` | $10/M | $30/M | 128K | Large documents |
| `gpt-4o` | $5/M | $15/M | 128K | Balanced |

**Example Cost**: 1000 process instances × 100 tokens (gpt-3.5-turbo) = ~$0.15

---

## Troubleshooting

### Error: "Invalid API Key"
**Cause**: Key format wrong or expired  
**Fix**: 
- Verify key starts with `sk-`
- Check key hasn't been revoked
- Use process variable: `${secrets.openaiKey}`

### Error: "Rate Limit Exceeded"  
**Cause**: Too many API calls too quickly  
**Fix**:
- Reduce concurrent process instances
- Implement retry logic with exponential backoff
- Add timer boundary events between retries
- Upgrade OpenAI account tier (standard → pro)

### Error: "Model Not Found"
**Cause**: Model name doesn't exist or not available in your region  
**Fix**:
- Check [OpenAI Models List](https://platform.openai.com/docs/models)
- For Azure OpenAI, verify deployment exists in your region
- Ensure API key has access to the model

### Response is Cut Off
**Cause**: Hitting `maxTokens` limit  
**Fix**:
- Increase `maxTokens` parameter
- Check token usage: `${tokenUsage.completionTokens}`
- Simplify prompt or use conversation summarization

### Very Slow Response
**Cause**: API latency spike or long response generation  
**Fix**:
- Increase task timeout (check Fluxnova configuration)
- Use `asyncBefore: true` for non-blocking execution
- Implement timeout boundary event
- Try faster model (`gpt-3.5-turbo` vs `gpt-4`)

---

## Integration Tips

### With Subprocesses
```xml
<bpmn:subProcess id="aiAnalysisProcess">
  <bpmn:serviceTask id="analyzeWithOpenAI" 
    name="Analyze with OpenAI"
    camunda:connectorId="openai-connector">
    <bpmn:inputParameter name="apiKey">${apiKey}</bpmn:inputParameter>
    <bpmn:inputParameter name="userMessage">Analyze: ${data}</bpmn:inputParameter>
    <bpmn:outputParameter name="result">${content}</bpmn:outputParameter>
  </bpmn:serviceTask>
</bpmn:subProcess>
```

### With Multi-Instance Tasks
```xml
<bpmn:multiInstanceLoopCharacteristics 
  isSequential="false" 
  camunda:collection="${documents}"
  camunda:elementVariable="doc" />
```

Call connector for each document in parallel.

### With Event Subprocesses
```xml
<bpmn:subProcess id="errorHandler" triggeredByEvent="true">
  <bpmn:startEvent id="apiErrorStart" isInterrupting="true">
    <bpmn:errorEventDefinition errorRef="OpenAIError" />
  </bpmn:startEvent>
  <!-- Retry logic here -->
</bpmn:subProcess>
```

---

## API Response Structure

The connector returns a complete response object:

```javascript
{
  content: "The capital of France is Paris.",
  model: "gpt-3.5-turbo",
  totalTokens: 23,
  finishReason: "stop",
  usage: {
    promptTokens: 12,
    completionTokens: 11,
    totalTokens: 23
  }
}
```

**Access in BPMN**:
- Content: `${content}`
- Token count: `${usage.totalTokens}`
- Finish reason: `${finishReason}` (values: "stop", "length", "content_filter")

---

## Resources

- [Full Implementation Guide](../OPENAI_MODELER_INTEGRATION.md)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [OpenAI Models](https://platform.openai.com/docs/models)
- [Fluxnova Documentation](https://docs.fluxnova.finos.org)

---

**Last Updated**: February 13, 2026  
**Maintainer**: Fluxnova Community
