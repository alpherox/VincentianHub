import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { QAQuestion, QAAnswer } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  MessageSquare,
  ThumbsUp,
  Send,
  Trash2,
  ChevronDown,
  User,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QASectionProps {
  researchId: string;
  authorId: string;
  questions: QAQuestion[];
  onAddQuestion: (content: string) => void;
  onAddAnswer: (questionId: string, content: string) => void;
  onUpvoteQuestion: (questionId: string) => void;
  onUpvoteAnswer: (questionId: string, answerId: string) => void;
  onDeleteQuestion?: (questionId: string) => void;
  onDeleteAnswer?: (questionId: string, answerId: string) => void;
}

export function QASection({
  researchId,
  authorId,
  questions,
  onAddQuestion,
  onAddAnswer,
  onUpvoteQuestion,
  onUpvoteAnswer,
  onDeleteQuestion,
  onDeleteAnswer,
}: QASectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState('');
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthorOrAdmin = user?.id === authorId || user?.role === 'admin';

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to ask questions.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onAddQuestion(newQuestion);
    setNewQuestion('');
    setIsSubmitting(false);
    toast({
      title: 'Question Posted!',
      description: 'Your question has been submitted successfully.',
    });
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const content = answerInputs[questionId];
    if (!content?.trim()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onAddAnswer(questionId, content);
    setAnswerInputs(prev => ({ ...prev, [questionId]: '' }));
    setIsSubmitting(false);
    toast({
      title: 'Answer Posted!',
      description: 'Your answer has been submitted successfully.',
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Questions & Answers</h3>
        <Badge variant="secondary" className="ml-auto">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="p-6 space-y-6">
        {/* Ask Question Form */}
        {isAuthenticated && (
          <div className="space-y-3">
            <Textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask an academic question about this research..."
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || isSubmitting}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Post Question
              </Button>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please <a href="/auth" className="text-primary hover:underline">log in</a> to ask questions.
            </p>
          </div>
        )}

        {/* Questions List */}
        {questions.length > 0 ? (
          <Accordion type="multiple" className="space-y-3">
            {questions.map((question) => (
              <AccordionItem
                key={question.id}
                value={question.id}
                className="border border-border rounded-lg px-4 data-[state=open]:bg-secondary/30"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-start gap-3 text-left flex-1">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {question.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{question.content}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {question.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(question.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pb-4">
                  {/* Question actions */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpvoteQuestion(question.id)}
                      className="gap-1.5 text-muted-foreground hover:text-accent"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      {question.upvotes}
                    </Button>
                    {(user?.role === 'admin' || user?.id === question.userId) && onDeleteQuestion && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteQuestion(question.id)}
                        className="gap-1.5 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Answers */}
                  <div className="space-y-4">
                    {question.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="flex gap-3 rounded-lg bg-secondary/50 p-4"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-accent/20 text-accent-foreground text-xs">
                            {answer.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{answer.userName}</span>
                            {answer.userId === authorId && (
                              <Badge variant="outline" className="text-xs">Author</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(answer.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90">{answer.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUpvoteAnswer(question.id, answer.id)}
                              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-accent"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {answer.upvotes}
                            </Button>
                            {(user?.role === 'admin' || user?.id === answer.userId) && onDeleteAnswer && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteAnswer(question.id, answer.id)}
                                className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Answer form (only for author/admin or any logged-in user) */}
                    {isAuthenticated && (
                      <div className="flex gap-3 mt-4">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {user?.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            value={answerInputs[question.id] || ''}
                            onChange={(e) =>
                              setAnswerInputs(prev => ({
                                ...prev,
                                [question.id]: e.target.value,
                              }))
                            }
                            placeholder={
                              isAuthorOrAdmin
                                ? "Reply to this question..."
                                : "Add your answer..."
                            }
                            className="min-h-[80px] resize-none"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleSubmitAnswer(question.id)}
                              disabled={!answerInputs[question.id]?.trim() || isSubmitting}
                              className="gap-1.5"
                            >
                              <Send className="h-3 w-3" />
                              Post Answer
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="mt-3 text-muted-foreground">
              No questions yet. Be the first to ask!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
