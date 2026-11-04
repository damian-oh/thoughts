---
title: What I Do Not Need to Know
tags:
  - abstraction
  - understanding
  - practicality
aliases:
  - /what-i-do-not-need-to-know
---

I have written backend applications in both C# with .NET and Python with FastAPI, and of the two, I prefer Python.

This is not because I believe Python is inherently superior. Both languages and their ecosystems offer powerful tools, and there are problems for which I might prefer one over the other. But I have always appreciated how Python allows me to concentrate on the problem I am trying to solve.

There is a small Easter egg in Python. If you run `import this`, the interpreter prints *The Zen of Python*, a collection of principles about how Python should be written.

Some of them have stayed with me.

*Explicit is better than implicit.*

*Simple is better than complex.*

*Complex is better than complicated.*

*Although practicality beats purity.*

I like the tension between them.

Making something explicit can help me understand it. It allows me to examine assumptions, identify dependencies, and see where a particular decision might fail.

But making something explicit does not necessarily require making everything explicit.

Here is a simple Python statement.

```python
print("Hello")
```

I can understand what this statement is supposed to do without knowing exactly how Python implements it. I do not need to inspect the interpreter or understand the electrical changes taking place in the hardware. Those details exist, and some of them may become important under different circumstances.

But for the task at hand, I can usually leave them alone. This is one of the things I appreciate about abstraction.

A useful abstraction allows me to work with a system without having to consider every detail of its implementation. It provides a boundary between what I currently need to know and what I can, at least for now, leave to another layer.

The complexity does not disappear. It remains somewhere beneath the interface. But I can focus on the problem I am trying to solve without reconstructing every process that makes the solution possible.

Of course, abstractions can fail.

An interface may conceal behaviour that would matter. A library may work differently from what I expected. A seemingly simple operation may involve costs or dependencies that become relevant only when something goes wrong.

The point is not that the lower layers are irrelevant. It is that they do not all need to occupy my attention at once.

I wonder whether I sometimes forget this distinction outside programming.

Suppose I am having a conversation with someone.

I do not know precisely how their brain works. I do not know which neural processes produce their thoughts, how their memories are represented, or what combination of experiences and circumstances has shaped the person sitting in front of me. Even if I had a complete map of the human brain, I doubt that it would tell me everything I might want to know about that particular person.

However, I can still speak with them. I can listen to what they say, ask questions, disagree, and perhaps come to understand something about how they see the world. None of this requires me to establish a complete explanation of the processes that make the conversation possible.

But the analogy has its limits. A person is not a software library. Their words and actions do not constitute an interface with a specified contract. I cannot assume that the same input will produce the same output, or that what someone tells me provides a complete description of what is happening within them.

Nor would I want to approach a person merely as a system whose behaviour I need to predict.

Still, the comparison raises a question. How much do I need to understand before I can meaningfully interact with something?

I have often tried to [[What Is Not Made Explicit|make things explicit]] before allowing myself to rely on them.

If I cannot explain a judgment, I become uncertain whether I understand it. If I cannot identify the assumptions behind a claim, I hesitate to accept it. If a distinction remains unclear, I tend to look for a case that might reveal its boundary.

I still find these habits useful.

There are situations in which the details matter enormously. A misunderstanding can have consequences. An assumption made without examination can lead to a decision I later regret.

I do not want to abandon the effort to understand things carefully. But perhaps I have sometimes demanded a level of understanding that the task did not require.

In programming, I rarely begin by asking whether I understand every layer of the system. I ask what I am trying to accomplish, what the available interface allows me to do, and what I need to know to use it reliably. If something goes wrong, I investigate further.

Perhaps there is something worth considering in that approach.

When I speak with someone, I do not necessarily need to understand everything that has made them who they are. I may only need to understand enough to [[A Conversation After the Show|listen carefully and respond to what they have said]].

If I misunderstand them, I can ask another question. If the conversation becomes more consequential, I may need to examine my assumptions more carefully. If I discover that my understanding was inadequate, I can revise it.

This does not mean that interacting with people is as simple as calling a function. There is no guarantee that another question will resolve a misunderstanding, or that I will recognize when I have failed to understand something important.

In software, an interface may come with documentation, specifications, tests, and observable guarantees. Outside software, the boundaries are often less clearly defined.

What is sufficient for an ordinary conversation may be insufficient for making a decision that affects someone else's life.

Perhaps the relevant question is not simply how much I know, but what I am trying to do with what I know. That question cannot always be answered in advance. I might discover what I need to understand only after I have begun.

There is also a distinction between using an abstraction and confusing it with the whole system.

I can use `print()` without understanding every layer beneath it. But I should not conclude that the interface tells me everything there is to know about how the program works.

Similarly, I can understand something about a person without understanding everything about them. But I should not mistake that partial understanding for a complete account of who they are.

I think that is what I find most appealing about the idea.

Not that I can disregard what I do not know, but that I might be able to recognize its existence without making complete understanding a condition for every action.

I can write a program while knowing that there are layers beneath the code I see. Perhaps I can also have a conversation while knowing that there is more to the person in front of me than I can explicitly understand.

I may have reasons to look further.

But I do not necessarily need to begin there.
