import { getChat } from "@/lib/chat-store";
import { ChatForm } from "@/components/chat-form";
import { redirect } from "next/navigation";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  try {
    const messages = await getChat(id);
    
    // Check if this chat exists
    if (!messages && typeof messages !== "object") {
      // If chat doesn't exist, redirect to home page
      redirect("/");
    }
    
    return (
      <div className="h-full">
        <ChatForm chatId={id} initialMessages={messages} />
      </div>
    );
  } catch (error) {
    // If there's an error, redirect to home page
    console.error("Error getting chat:", error);
    redirect("/");
  }
}
