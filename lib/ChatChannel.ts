import { rand, randFullName, randNumber, randSentence } from "@ngneat/falso";

type GetMessageParams = { limit?: number } | { before: number; limit?: number };

export class ChatChannel {
  public users: ChatUser[];
  private localIdCounter = 0;
  public messages: ChatMessage[] = [];

  public onNewMessages = (messages: ChatMessage[]) => {
    void messages;
  };
  public currentUser: ChatUser;
  private otherUser: ChatUser;
  private loading = false;
  public loaded = false;

  constructor(
    public name: string,
    private totalMessages: number,
  ) {
    this.users = Array.from({ length: 2 }, (_, i) => new ChatUser(i));
    this.currentUser = this.users[0];
    this.otherUser = this.users[1];
    if (this.totalMessages === 0) {
      this.loaded = true;
    }
  }

  async getMessages(params: GetMessageParams) {
    if (this.loading) {
      return null;
    }

    this.loading = true;

    await new Promise((r) => setTimeout(r, 1000));
    const { limit = 10 } = params;
    this.loading = false;

    if (!this.loaded) {
      this.loaded = true;
    }

    if (this.messages.length >= this.totalMessages) {
      return [];
    }

    // prepending messages, simplified for the sake of the example
    if ("before" in params) {
      if (this.messages.length >= this.totalMessages) {
        return [];
      }

      const offset = this.totalMessages - this.messages.length - limit;

      const newMessages = Array.from({ length: limit }, (_, i) => {
        const id = offset + i;
        return new ChatMessage(id, rand(this.users));
      });
      this.messages = newMessages.concat(this.messages);
      return newMessages;
    } else {
      // initial load
      this.messages = Array.from({ length: limit }, (_, i) => {
        const id = this.totalMessages - limit + i;
        return new ChatMessage(id, rand(this.users));
      });
      return this.messages;
    }
  }

  createNewMessageFromAnotherUser() {
    const newMessage = new ChatMessage(this.messages.length, this.otherUser);
    this.messages.push(newMessage);
    this.onNewMessages([newMessage]);
  }

  sendOwnMessage() {
    const tempMessage = new ChatMessage(null, this.currentUser);
    tempMessage.localId = ++this.localIdCounter;
    tempMessage.delivered = false;

    setTimeout(() => {
      const deliveredMessage = new ChatMessage(
        this.messages.length,
        this.currentUser,
        tempMessage.message,
      );
      deliveredMessage.localId = tempMessage.localId;
      this.messages.push(deliveredMessage);
      this.onNewMessages([deliveredMessage]);
    }, 1000);

    return tempMessage;
  }
}

export class ChatUser {
  constructor(
    public id: number | null,
    public name = randFullName(),
    public avatar = `https://i.pravatar.cc/30?u=${encodeURIComponent(name)}`,
  ) {}
}

// a ChatMessage class with a random message
export class ChatMessage {
  public delivered = true;
  public localId: number | null = null;
  constructor(
    public id: number | null,
    public user: ChatUser,
    public message = randSentence({
      length: randNumber({ min: 1, max: 5 }),
    }).join(" "),
  ) {}
}
