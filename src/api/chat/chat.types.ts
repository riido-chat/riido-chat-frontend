export type Citation = {
  citationNumber: number;
  documentTitle: string;
  sectionPath: string[];
  sourceUrl: string;
};

export type AnswerDeltaPayload = {
  delta: string;
};

export type CitationReadyPayload = {
  citations: Citation[];
};

export type AnswerWithheldPayload = {
  status: 'WITHHELD';
  reasonCode: 'INSUFFICIENT_EVIDENCE';
  message: string;
};

export type ErrorPayload = {
  status: 'ERROR';
  code: 'UPSTREAM_ERROR';
  message: string;
  retryable: boolean;
};

export type DonePayload = {
  conversationId: string;
  ragRunId: string;
  status: 'COMPLETED';
};

export type ChatSseEvent =
  | {
      type: 'answer.delta';
      data: AnswerDeltaPayload;
    }
  | {
      type: 'citation.ready';
      data: CitationReadyPayload;
    }
  | {
      type: 'answer.withheld';
      data: AnswerWithheldPayload;
    }
  | {
      type: 'error';
      data: ErrorPayload;
    }
  | {
      type: 'done';
      data: DonePayload;
    };

export type ChatRequest = {
  question: string;
  conversationId?: string;
};
