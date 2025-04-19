import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, CreditCard, Info, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw, Landmark, Banknote, QrCode, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Plan, ModulePlan } from "@shared/schema";
import { stripePromise, createPlanPaymentIntent, createModulePaymentIntent, confirmPlanPayment, confirmModulePayment } from "@/lib/stripeClient";
import SubscriptionForm from "@/components/subscription/SubscriptionForm";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Componente de formulário de pagamento do ComplyPay
function ComplyPayCheckoutForm({ 
  planId, 
  organizationId, 
  successUrl 
}: { 
  planId: number, 
  organizationId: number, 
  successUrl: string 
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
  const [installments, setInstallments] = useState<number>(1);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  const [cardholderName, setCardholderName] = useState<string>('');
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [boletoBarcode, setBoletoBarcode] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulação: Envio da requisição de pagamento para o ComplyPay (Zoop)
      // Em uma implementação real, enviaríamos os dados ao backend
      
      if (paymentMethod === 'credit_card') {
        // Validação básica do cartão
        if (!cardNumber || !cardExpiry || !cardCvc || !cardholderName) {
          throw new Error("Por favor, preencha todos os campos do cartão");
        }
        
        // Simulação de processamento de pagamento com cartão
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulação de confirmação de pagamento bem-sucedido
        toast({
          title: "Pagamento aprovado!",
          description: "Seu pagamento com cartão foi processado com sucesso.",
        });
        
        // Redirecionar após pagamento
        navigate(successUrl);
      } 
      else if (paymentMethod === 'pix') {
        // Simulação de geração de QR code PIX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // QR Code seria gerado no backend e retornado
        setPixQrCode("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAEqFJREFUeF7tnTnO5UQQhj0OgVhhB8GG2NfIbN4PhLMHYTkGR4CDAMKwb4FYYwMOUC0UGoZm3qsul6tcrvpC4JnutsvlT39dlcse3fvXz3976D8UEAJS4OFHjx4+fPTr3799858UPLiIUEACgPjigIH//PPnPn364vO333rxZSshyQCwjblzTyYAcM4u+oPj4N/58/wTESBpATRG3LAnEgA2zBrHoXTwr3wFhCQtgMZoG/ZEAsC8WXMc/DuuwbQAXEJr24wJAG2xm7anh/g389ICmA6lvR8gAGzIjdr0f+gCCJQBoC7mvp0JANxzZ/zx3vRvtWQXQG30fToTAHzmSvbTNtP/jRtXH5cBoC7mfp0JAH6ZI31Dm/6tjcl3SAtAGnHb5qcEgG0zZ//hPelf+xtCEgD0MffsSACQyKCzzMqZCBgBgLQAJOLu15gAwD93ZE/SWvy7ujNZAHVx9+lMAPDJleKnFJr+tbtPvv/6/TdfetHPxfoQANzTSACQyKCjTGHw73iaAIBjQh2aEAAckkT6EYamf4sLAYA05v7tCQD+OVTqQYmmPwFAaYAdOxEAHJMl+7HWpn/Rk1mA7HDrbiAAKOamm/FfXa21CyCroLud4+NLAIifozt/YLDpfwYAIgN313Uj4AkAG2ZtdOGPFgAYAdhw3RAANswaqfCrwH+cAn6A6oLFJQIAi6ToGqK06X8CADIANN0uboQAYJch3RpyNf1Pbo9yAXTF2LcXAcA3X4qf5tz0P62BXYCiULt3IgC4p0z2A32a/pXrIgCQjbj/DQQAh5zJmv69vqcMgEPCPT+SAOCQO8mmfwv+k0IkA+CQcL+PJAA45I+06d9sTH0ASgXQEIf7PjoBwOETdvjrTpfUNv1bvYn+2iF33p9BABjMHeXgn+qHmYDBQAtfngAwkE/am/6lEtACGIi5wKUJAANJ5TH4jzIAvz94//2333j5lcFU4dIbKhAAOlIl0/RvoX9xX8gC6Ai6wK0EgIYkyqbpf3Id7AQQADQEneGWE/jVh/T5nX4tTX8CgGKgGbq1YwBWAUC56V/ZAGYBOgLPcOv8ALAb/OsDPpCj6U/rABluTvke8wFA9uBfvQU2/aWXOWcvqf+39c0NAPzB16U6Z9OfAMAVfPPGcwIA38EXq6b/1VXNRUDzg+LwL+YCgMzTfyv1S98nXlP/jzv4Rr5hHgDYMvjnhNB/yfnSsK2bSdLfyADYmOfnAoDc079n1spt+rd8AhkAAYDpgT5/AKQP/kD+HcDIIiNaAKoBsP6Q/gAIfPvPGvytPsgCqLKf3pkAIJVe9xoLx/6LX+DZCdAdfLktAoDcHBgNvpEsQKQMQPGcKN01GcwMJgAMvAQ9By/PbVpagAD1AAYCPnhpAoB0gnFVm6b/2ScUvvwKZQC4KDDdnACglVGcTf+TKyQDMB1ylR8gAEjlU6Tp3/oaVgGohlr15gAAqC/8CQz+5fCwC6D6HQwPAM7gZ2n6t1J6ZByZBQh/RsUGgCLwtZv+tYuT3wOgHkD02//Wd2QA3ABQbGr1qjfT9OeaAC4CGvkmposBACqnf+/FPw4JI/UBpJ7+y32BAOBi+leHfLDpTwDQHnVGAFRZ0B75h7VrF/9ggY0AgPP0vzoLyADcgdUQAFqb/o3F2TJU5fDftxJ3F1fvQOgCqI1GBgCUfwN+nZP/vumvmn7aIvhBOlEALHP6c536rZDxPA5MFkA1XVsAUG/6t0Jrb/prBj9TC9C56U8GoBWB0S8AkAVAvenvnf5TCi6FAPRBO0kAcISJ9A//aJ3+ZABuA1cAmDj9vdP/ngB4rAOwiwCM+V99UdAHCAGAMvD1mv4j6T4ZAHftgD0BYHb637T51Jv+CgBQ9wM0w7YHAAQW+BxDM9r0ZxZgz+DTFQCnz0HT/9qJEAB4RGLDVgCYavrv1/Rv3qN1+rfS9noBUH7XQBcAM07/RvDzTn91ANirrsBKADQ1/WvLbAeC5ND0p5G4zKxZEQDNyXhd5NP/bX73B3Qw/RnwnR9MCgDoc/rfpPqSqT/vRb/lArDnHYMKAKJr+ncG26vpX2YptADw+KLhUAYAm/6Pl2kduD0pOP1bCGZuAXBNgBkA3Nv012j6U/nP8xqAKQAYm/5nmYDNpz+b/gxJuxGWAHAGgFzTv9j0FxruzQgHTf/TAqrX/RQzAAwAo+l/SJ+QTX82/ccDLg0Aj6Z/ufDHq+lvAQAGvOv3ABYAUPXpf65B6GUAaAGMh1wKAKs2/Y/JqDT9CQDjgZZYARhdAPRo+pcLf1wpP8kJhoDlMT+29gVAmaa/ZmPOA0CewXdzMj0AuDX9G4XEnTJ+CgBoAYSlAGAHgI2m/xZ1/U1N/xMH8mQArEVCvgFwOkQDm/7mpr/X9CcDEJYAIACAUdO/KPR5bflppv6MuQaqAXvfbgWA06qvyaZ/r4AnrU3/a3/Zfmm8FADwB/qkCQtAQ4tmfQCoNf0DZQU4aQWGjQWA3mlp+tvTe+wCZAKA5fQfePMzbPprGgFl5oBZgGEB4DEZtacAXZr+nSKdrQxAt+nPgOdeDQgbC4DT016mw5/9g38r+MLTP1QNAO+mPwEgHAAmm/6eCOAKgJbgnOkC6Db9DxIzCxDKAphu+jcWAL0AIN/0PzbCOgsRImdBOkbGiwCg1/RPm/bLLPyJBABHBmDr6d9z9bqsXQBm0W9j5AqAEoA1mv6jQQ0EgCgZgGrAJpv+tABGvxXfrxcFANxN/1P2IecioAMDxswAKADYs+l/Ol7NDEA3mcdN/4Oe3CnhS4PXBQD8wGMXQCH0wwAgnaa/JAjs0ALOYGAXoFPo1O4OBwDOpr8kBQAyAGnv0vAASGYwFKd/P1hbACBqHQCV//qSYQCQNdIyxbqj6V/GAQkB+oJ31rPCAgBTZIyQf9X1xzYBOIF31HRoAOQL+h1N/7fCZwG6gj/YCOsGANfpXz34xKb/QT+kd6C0BQamfwNYoQDA2fRvhdHe9D9dOzoAaNKPrIcK7QBILULZafq/GX76kwHoC712M8wAGGn6D6S8quLezgDcnPYbTv+bVGXTv51LGwJA94CNXJzTA4Csiz10m/4aSJSuEbg5/YNN/2PD8GwDMAswMADaAcB6+t+z6V9jgqrwdzi9JaZ/o2aWTX9OT0oK2gCQTGXXKTd9QUXSP32bz7np32g6kgXQTY81O4YHQCvXNpr+CioBEQBQU/DX4aKfjfT/JNVNA8KSJwNwO6z5LgASgGUHZfBPBV7bA8DCH9UUYEIArDn9F2n6twTxnLKwdQEgDgA8g78V1L2m/+k+r8yNIgCMPO3QuhYAoJj+2jX9S1+ZBYgSdO1+xACAowALN/3LLIAGBZkF0P5e9J8OAFDw9O9tqlkAQCULQADooRinL/2bGQDOpv95QS97FkAl/WcGIPGzRrsAXE3/2rYNWgAuABhZ8dd5tgwZgNrN4+l/AiC/dQFG00XeZtxgEAB4mMrDBN47/XsVgvcGAJYAAGBmAZqiUALAQvP/yjHdpn/vFVYAfO2Ac07tHwBMCYCu6c8swP43O44HBIC96a/d3Kt156QhKQVAeQbPl98EgFYG4N5N/1YXIQoAHBf/XJ0JWyLA/TAgANRBTNn073WZAKAXvDP3xwmA2abvBk3/1vdImQXwXAzkftFP43fQF9yyLwMAl+l/kGl08jALoDp9FxzcCgBmm763Tn+e6f/y5mYLQPdpF5jPLAFQjvtKCn5W9+9p+te+J89mIK/gKX30PQoA+Jn+ZXdg26Y/LYD7Rp8AkPP0PwnMmf47UQBAK/KXAcCuAEA2/c9LkgvBLICgQOJrXxgA9qapgQ1/qwX/4kP0Q0GZQ8HugxIbAFem/0kP7aa/YPBvZQGkBMC2b8AiiJUAcDL9i0t0RtbnmgC0AASFwjq3hATA5fSvLbDZsOlfl4ARAIGmfyvk9QCgu9tff0g0+B2DxAoAZfrfy/RnFkBXKOz2xQEAaZ/+1yKwCyB4+gc3/VvrGxoAwj39z8lkRQBu+o+KuvcKgCzTf6T42P3Snx1qAvQKnXP/9ADQAUCp6X8dM3Hpz7TUh6MFWgDCYbLyAzEAYATAVdO/dtqLBzebJQJqOxAGgn3n03/kk2YCgDQA+NL9g1dNvxEBBMVCg01/c9OfQKAQJnFjYQFA+CzA1Tz9W8M1WxZAedGPePC3TBkZAH1rANQXADVS+CJT0dj0Vw9+dgyUg69kMhUAdgZAdfFPqxBo9Ka/wjDRFCGUADApAPA4HdzXsNYC8Gv6n0VgF0AmfLbbLgYA+N7gu9GmvzwA9Jr+ZAFUBTK0M6EBYJj+/cU/jSmgCgB80/9CIm4G4ojF+qpLAUCw8OfKM8HiH0gLYKulvE4Q0QwA+3fAXPwzPP0LBGR5AKwrgOSZgLUBgNG7AFzT/yo21AE4Lv5JHv0xASA9/TdZ/KMMgB2nf+FnVABwJ/zTKQGQcvFPafqPNM04py+7ALcjaH0AtDb+9E//5M1/1bF0VYFwTX+u/BELrbAbBNcHlPvjjOEV5JH+wk3/GxYYAeB1+lMLoJBnwLZhAWBpYt1n+jMMOUPJUv/P2AK4PjRUZga8AaA1/Y+HjMk+u5v+p+rXALBV7YBaEA1NkGEBwAfA1fR/03Pwpj+n/58BgAUAoE3/xIUAI6ZfhSAIHwBa0/+Y+1JN/2t3W7MA0k3/k2SsB5gmCPPGUQCg1fTf/PSnaT9dI6yrC6A7/c8a8aPwrg+AW9O/tdhkxfT/TsL0P+1JJgCwY/hXsaT7XTIEgOETf/LiH42j1ZgF4Jr+xIGhUFl1dQxATcH/FgBEMR5bAIQEgFX70HtP/9I11WvAuaZ/0hpAN9eSFbcAoJf7Kqe/d9Of+/SvXeJFALgejWQAJEfK5W07AOgyXe8RAC0AOIpxRCn9t8oCRHh3YS4A1H8FqLGnPkXTf/gLBJr+2bsAbAAYi7+Bq3sBYMTJqnFQMADUZwYEp3/6u/h6hc6xP9M0H8iwWZPQEKgx/acP7E8CAJEZ0MiHDdqtCIChVJn0mJAAgKkf8MdYD6Cnmk+r1QHwxlTTpv+FbFG6AGIZAKNRsrQF4FkEPGsCwNn0nwk2AaBeFOSVA3ZAZjkAXhYCXYkCBgA9mv4zAc8AgAQZgIIj5XMZASCcA8BWFuDKazQLoNn0n3nyjy4CchEwKQCKIGrXAXAZEtkWQKfp/2Yr+N6ZAK98Uy89llyN+T4VAFiOf1dAiLKXXGUBNmn6nyi22SLg3aZ/uY6TcnJGNpwKAHRO/9eqK77X8O4BEKELcJfpT+UfeQIQAKZ+ACCVX/o2CwAwLv757DrwozAAh2nPdbrPBF/S4F8CAKOL/9EaAAQA02iwtAlg0fRnCrD2k34OQqX5QAzgCgAUX/xTCK2a9s+UAZBo+uf8JuD8AUgsAS4DoJbCizIA3Kf/1YKp6a5AdAC0Nr+nAHoO6Nn0P0mVIgOQCwAmT/9ZADhIFxUArQufR9J5Jv1PD4B/R7cAJJr+Df+GAFrGYFgA6NH4GzUcCQBdIQsMAOmmf+HYCgDo3q1oN2YBgC0W/1hNf0H18yjZnZ0B2K7pX0qZMgOw5/Q/PdFnAGAZjNOmf+f0/+F5JzR+CyC7+Gdi+q8BADrKyYXWbU3/qxUyC3A3m/pVwGkAlCn+SbLpf3r9ngAg3fTnGIjxAECj6b9y8HOk/YM3AXg1/Y9FsVRNfyvwpSqJiQBAA+h0mv7TbmzTTdEMQJTp79L0b4jBDECPsjEBMB38F2k4Ov0lTv+rg0obbhPfARB5AbAiADzy3aLpL/3kn80CyC7+0fb/OviqzswCgGvRsHTT3wpAsQCEvejX2PQ3JwJX/FiiAGgW/ayZ9rs5s8z0LwU5ZQGuAsoi1DYA0EEzZgGSNv1bPoQAwDDl4wBA4PQ3Az7j4j/zl4DMWYDYAIgy/bsCb0fTv/Uq7wkAqymfBgAnj1Jq+k+7tswCJJn+6gIsBYDK9Pds+p8VCrn4Z8+mf0sPigAYCWA5AFhO/+lgVwSgeAag6/Q/y5UlAMiDYTkAWE7/qaBvLZD5LoBH01/jW0QkGQBlCKwNgHu+25zNx6WmPxf/MAtwGyvLAmBm+q++CiDc9G8ZKQJAdyjsAQDW038q9QaAb+ICiDX9hdmBbpEnBADvpr/Eie8MgKhZALbpz5QCrAEAZ9N/yviB1WDrAkhMf2oBzAI/HAB6Nf2vv4QRATyXADvWAbBP/5MVJQKEZ1R8AFhO/1kQKAJAs+m/06KfKd8EA54FADim/1UMLKd/6/14AuB007/VDt21E3ABAGfTvyuoHZr+J9nQZ90kpz9FgAwAZACAovnvKbvkewHoAgyFmgBwxlbfk3GQBvdtZgGsCFg1/XtCaEHTv5WSXQCFQNsLAFzTf6MsgMTpvwIAGBb/sEz/GQDwXgNAF0A4IGIDEEHW3qb/8EIfpgzAbNO/kGrLDECfx85++hMAprMO5AF8BwAGT//pp/9gwqVu+nMREAsBOZv+nQbHWM6Lm/5FFsC76c8swFipvzsAsE1/7+l/tSZbBoB9+jMLoCMAAcDU9FcMfC0ALDf9a7GxzlzA5NO/fE8gAeAOkQgAdU3/mfT+k8VNf4lY5pr+TmcDyQDcIRADQLbpf1gGIJgF0Gz6cwXgHYI7NAB0p/9VhQ6m/xYWAF//jcKfBQCmm/6bA0Cbju4A4HrhTwMIrE1/7gJoBv8KADCc/vfu+2tQ5LRrIFgJaG36t3zRCgDwWvijseDJODhWA0DLWzADUBdl9aY/FwGNhRsHAMQLfxyb/qPBv/U6AFaZAOemf+0VyQBwh8qSALBs+ncFvCIA7bYOYLbpTwC4QwgAWNP0L4MrFQDSLP7xSbV9T/9rVzkzACvk/d4AYGv6D4NBQQCJj3d4/bSa/oeWHGsA9s7xQADQGNChpv+MQxl2AdjSf+/UXxoAjgDA1vQ/yZUlA3D19K+L193Tf7ssgPKbP/HlCQAKEbg5/ScBYDm4DADgmv6t12J5ADStpz/BEwDBASB50c+Qkw6n/2wWYDUAeD3lex4HAsA9swN3fVcU/WgDQGYBVm76t7ycAQDKXwB+P2CeaUcAMM1Rq5Pu6b9S05/fA7gOsekAKK7BPP3Tzw6w1QEI1vRnFqA+bKYCgHP6n/JW3PQvPthj+gtmDGQBgG36c1cgSvDrft4vFwDUQ8Hdw2TTX9dLSXdbBwD81AFId/rTArA96z0BYAXAlkHPdPrXRF1NAFoAuu8ALwCQ2xkwOPNXA0Dx6X8VMc7pTwDIHgANAMg7xgVAvabsQE5kCgDlJ/8q6T9aAMCdBWhN/yUB8ObPP3z0+LNP1QBQtMmQBssy/U93xAYAx6u/lSVAdiOmBUBdv7Z9BQBwTn9Z4f9b/9UAwPX0X6rpXzsbZAH0nv6BARBt+tcg8CtBSQs6sv0CnwDIlvWy/nI3/bmyLgvMvT4nNAD4Fv50BXGm6b+KBZB5+vtJ2fqk8AAgbvyJqNna9Gcn4E6huC0ASDmppv7cHNlxFcCSC39q4RAQAIqTszX9ZRdY0QKYvvVdPhBNn2AAaLxH3Nf0d3r6c4FV7d0o+3cJAKSZ/kcOgmcBQgOAt+lfg1mW6d+mADMAIQFwq+nvNdAbGwG8p/9JVQLA3aNxHwAoTv+t6wDMm/5Hj7Ac/DdNOACw8+l/wHSLpv+FBtsB4Nb0N6/+k7YAGAA/AKDu7B1N/1kL5NwFiAQAj6b/cSBwZAF2AkB8APIp/wNWCOxCccQyXgAAAABJRU5ErkJggg==");
        
        toast({
          title: "QR Code PIX gerado",
          description: "Escaneie o QR Code para finalizar o pagamento.",
        });
      } 
      else if (paymentMethod === 'boleto') {
        // Simulação de geração de boleto
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Código de barras seria gerado no backend e retornado
        setBoletoBarcode("34191.79001 01043.510047 91020.150008 9 87860000029990");
        
        toast({
          title: "Boleto gerado",
          description: "O boleto foi gerado e está disponível para pagamento.",
        });
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Ocorreu um erro ao processar o pagamento.");
      toast({
        title: "Erro no pagamento",
        description: error.message || "Ocorreu um erro ao processar o pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Se tiver um QR code PIX gerado, exibir
  if (pixQrCode) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pagamento por PIX</AlertTitle>
          <AlertDescription>
            Escaneie o QR Code abaixo usando o app do seu banco para finalizar o pagamento.
            O sistema de assinatura será ativado automaticamente após a confirmação.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/30">
          <div className="text-center mb-4">
            <h3 className="font-medium">QR Code PIX</h3>
            <p className="text-sm text-muted-foreground">Escaneie com o aplicativo do seu banco</p>
          </div>
          <img src={pixQrCode} alt="QR Code PIX" className="w-64 h-64 mb-4" />
          <Button 
            variant="outline"
            onClick={() => navigate(successUrl)}
            className="mt-4"
          >
            Já realizei o pagamento
          </Button>
        </div>
      </div>
    );
  }
  
  // Se tiver um boleto gerado, exibir
  if (boletoBarcode) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pagamento por Boleto</AlertTitle>
          <AlertDescription>
            Use o código de barras abaixo para pagar o boleto no aplicativo do seu banco 
            ou em qualquer agência bancária ou casa lotérica.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col p-6 border rounded-lg bg-muted/30">
          <div className="mb-4">
            <h3 className="font-medium">Código de Barras</h3>
            <p className="text-sm text-muted-foreground mb-2">Copie e cole no aplicativo do seu banco</p>
            <div className="flex">
              <Input value={boletoBarcode} readOnly className="font-mono text-sm" />
              <Button 
                variant="outline" 
                className="ml-2" 
                onClick={() => {
                  navigator.clipboard.writeText(boletoBarcode);
                  toast({
                    title: "Código copiado",
                    description: "O código de barras foi copiado para a área de transferência.",
                  });
                }}
              >
                Copiar
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              O boleto pode levar até 3 dias úteis para ser processado.
              Após a confirmação do pagamento, sua assinatura será ativada automaticamente.
            </p>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => navigate(successUrl)}
            className="mt-6"
          >
            Já realizei o pagamento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no pagamento</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="credit_card">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger 
            value="credit_card" 
            onClick={() => setPaymentMethod('credit_card')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Cartão</span>
          </TabsTrigger>
          <TabsTrigger 
            value="pix" 
            onClick={() => setPaymentMethod('pix')}
            className="flex items-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            <span>PIX</span>
          </TabsTrigger>
          <TabsTrigger 
            value="boleto" 
            onClick={() => setPaymentMethod('boleto')}
            className="flex items-center gap-2"
          >
            <Landmark className="h-4 w-4" />
            <span>Boleto</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="credit_card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Nome no cartão</Label>
              <Input 
                id="cardholderName" 
                placeholder="Nome como aparece no cartão" 
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do cartão</Label>
              <Input 
                id="cardNumber" 
                placeholder="0000 0000 0000 0000" 
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Validade</Label>
                <Input 
                  id="cardExpiry" 
                  placeholder="MM/AA" 
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardCvc">CVC</Label>
                <Input 
                  id="cardCvc" 
                  placeholder="123" 
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="installments">Parcelamento</Label>
              <RadioGroup 
                defaultValue="1" 
                value={installments.toString()}
                onValueChange={(value) => setInstallments(parseInt(value))}
              >
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1">À vista</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="r2" />
                    <Label htmlFor="r2">3x sem juros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6" id="r3" />
                    <Label htmlFor="r3">6x sem juros</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12" id="r4" />
                    <Label htmlFor="r4">12x sem juros</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processando..." : "Confirmar pagamento"}
            </Button>
          </form>
        </TabsContent>
        
        <TabsContent value="pix">
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Pagamento via PIX</AlertTitle>
              <AlertDescription>
                Ao clicar em "Gerar QR Code", você receberá um QR Code para pagamento via PIX.
                O pagamento é processado instantaneamente.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/30">
              <QrCode className="h-16 w-16 mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-1">Pagamento via PIX</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Rápido, seguro e sem taxas adicionais
              </p>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full max-w-xs"
              >
                {isProcessing ? "Gerando QR Code..." : "Gerar QR Code PIX"}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="boleto">
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Pagamento por Boleto</AlertTitle>
              <AlertDescription>
                Ao clicar em "Gerar Boleto", você receberá um código de barras para pagamento.
                O boleto pode levar até 3 dias úteis para ser compensado.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/30">
              <Landmark className="h-16 w-16 mb-4 text-primary" />
              <h3 className="text-lg font-medium mb-1">Boleto Bancário</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Pague em qualquer banco, casa lotérica ou internet banking
              </p>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full max-w-xs"
              >
                {isProcessing ? "Gerando boleto..." : "Gerar Boleto"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente de formulário de pagamento
function CheckoutForm({ clientSecret, successUrl }: { clientSecret: string, successUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Primeiro, confirme o pagamento com o Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + successUrl,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Se houver erro, exiba o erro
        setErrorMessage(error.message || "Ocorreu um erro ao processar o pagamento.");
        toast({
          title: "Erro no pagamento",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Se o pagamento foi bem-sucedido, atualize o sistema
        try {
          // Obter o tipo e ID da URL
          const urlParams = new URLSearchParams(window.location.search);
          const type = urlParams.get('type') as 'plan' | 'module' || 'plan';
          const organizationId = parseInt(urlParams.get('organizationId') || '0', 10);
          
          // Confirmar o pagamento no backend
          if (type === 'plan') {
            await confirmPlanPayment(paymentIntent.id, organizationId);
          } else {
            await confirmModulePayment(paymentIntent.id);
          }
          
          // Exibe mensagem de sucesso
          toast({
            title: "Pagamento aprovado!",
            description: "Seu pagamento foi processado com sucesso.",
          });
          
          // Redireciona para a página de login ao invés da página de sucesso
          navigate('/login');
        } catch (confirmError: any) {
          setErrorMessage("Pagamento realizado, mas houve um erro ao atualizar o sistema. Entre em contato com o suporte.");
          toast({
            title: "Erro na confirmação",
            description: confirmError.message,
            variant: "destructive",
          });
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Ocorreu um erro ao processar o pagamento.");
      toast({
        title: "Erro no pagamento",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no pagamento</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processando..." : "Confirmar pagamento"}
      </Button>
    </form>
  );
}

interface CheckoutProps {
  type: 'plan' | 'module';
  itemId: number;
  organizationId?: number;
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [params, setParams] = useLocation();
  const { toast } = useToast();
  
  // Extrair parâmetros da URL
  const urlParams = new URLSearchParams(params.split('?')[1] || '');
  const type = urlParams.get('type') as 'plan' | 'module' || 'plan';
  const itemId = parseInt(urlParams.get('itemId') || '0', 10);
  const organizationId = parseInt(urlParams.get('organizationId') || '0', 10);
  const returnUrl = urlParams.get('returnUrl') || '/';
  const paymentMode = urlParams.get('mode') || 'onetime'; // 'onetime' ou 'subscription'
  const gateway = urlParams.get('gateway') || 'stripe'; // 'stripe' ou 'complypay'
  
  // Buscar detalhes do plano ou módulo
  const { data: planData } = useQuery<Plan>({
    queryKey: ['/api/plans', itemId],
    enabled: type === 'plan' && itemId > 0,
  });
  
  const { data: modulePlanData } = useQuery<ModulePlan>({
    queryKey: ['/api/module-plans', itemId],
    enabled: type === 'module' && itemId > 0,
  });

  // Criar intent de pagamento ao carregar
  useEffect(() => {
    const createIntent = async () => {
      try {
        let clientSecret = '';
        
        // Usar as funções do cliente Stripe
        if (type === 'plan') {
          clientSecret = await createPlanPaymentIntent(itemId);
        } else {
          clientSecret = await createModulePaymentIntent(itemId, organizationId);
        }
        
        setClientSecret(clientSecret);
      } catch (error: any) {
        setProcessingError(error.message);
        toast({
          title: "Erro de processamento",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    if (itemId > 0) {
      createIntent();
    }
  }, [itemId, type, organizationId, toast]);

  // Item que está sendo comprado
  const item = type === 'plan' ? planData : modulePlanData;
  
  // Se não tiver Stripe ou item, mostrar erro
  if (!stripePromise) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração de pagamento inválida</AlertTitle>
          <AlertDescription>
            O sistema de pagamento não está configurado corretamente. 
            Entre em contato com o suporte para resolver este problema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!item && !processingError) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => setParams(returnUrl || '/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamento Seguro
              </CardTitle>
              <CardDescription>
                {gateway === 'complypay' 
                  ? 'Todos os pagamentos são processados de forma segura pela ComplyPay'
                  : 'Todos os pagamentos são processados de forma segura pela Stripe'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processingError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro de processamento</AlertTitle>
                  <AlertDescription>{processingError}</AlertDescription>
                </Alert>
              ) : paymentMode === 'subscription' && planData ? (
                // Usar formulário de assinatura para pagamentos recorrentes
                <SubscriptionForm 
                  plan={planData} 
                  organizationId={organizationId} 
                  onSuccess={() => {
                    toast({
                      title: "Assinatura ativada!",
                      description: "Sua assinatura foi ativada com sucesso.",
                    });
                    setParams('/login');
                  }} 
                />
              ) : clientSecret ? (
                gateway === 'complypay' ? (
                  // Usar formulário de pagamento ComplyPay
                  <ComplyPayCheckoutForm 
                    planId={itemId} 
                    organizationId={organizationId} 
                    successUrl="/login"
                  />
                ) : (
                  // Usar formulário de pagamento Stripe
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm clientSecret={clientSecret} successUrl="/login" />
                  </Elements>
                )
              ) : (
                <div className="flex justify-center p-6">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {type === 'plan' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Opções de pagamento:</div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={paymentMode === 'onetime' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newParams = new URLSearchParams(params.split('?')[1] || '');
                        newParams.set('mode', 'onetime');
                        setParams(`${params.split('?')[0]}?${newParams.toString()}`);
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagamento único
                    </Button>
                    <Button 
                      variant={paymentMode === 'subscription' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newParams = new URLSearchParams(params.split('?')[1] || '');
                        newParams.set('mode', 'subscription');
                        setParams(`${params.split('?')[0]}?${newParams.toString()}`);
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Assinatura mensal
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item && (
                <>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="font-medium mb-2">Incluído:</div>
                    <ul className="space-y-1">
                      {Array.isArray(item.features) && item.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center font-medium">
                <span>Total:</span>
                <span className="text-xl">
                  R$ {typeof item?.price === 'number' ? item.price.toFixed(2).replace('.', ',') : item?.price}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Ciclo de cobrança: {type === 'plan' ? 'Mensal' : 
                  modulePlanData?.billing_cycle === 'monthly' ? 'Mensal' : 
                  modulePlanData?.billing_cycle === 'yearly' ? 'Anual' : 'Mensal'}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 flex-col items-start space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Ao confirmar o pagamento, você concorda com os termos de serviço 
                  e política de privacidade da plataforma.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-500" />
                <span>
                  Sua assinatura será ativada imediatamente após a confirmação do pagamento.
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}