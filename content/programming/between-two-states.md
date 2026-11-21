---
title: Between Two States
tags:
  - consciousness
  - modelling
  - self-understanding
aliases:
  - /between-two-states
---

A little over a year ago, I tried to describe how I experienced consciousness. At the time, I thought of myself as moving between two states.

In one, I observed and examined the world around me. I questioned what I perceived, what I could know, and whether I could be certain of any of it. I could think clearly, but the process was often exhausting. Sometimes, the questions themselves became a source of distress.

I called this the `ObservingState`.

The other state was different. I experienced what I described as the *warmth of existence*. I was not merely examining my experience. I felt that I was participating in it.

I called this the `ExistingState`.

It was rare. At the time, I estimated that I experienced it perhaps three or four times a year. Those moments were precious to me.

I described these experiences to Gemini and asked it to turn my description into a [Python program](https://github.com/damian-oh/consciousness-oscillation). I reviewed the code it produced, checked what different parts meant, and made changes where I thought they were necessary.

The program had a `Consciousness` object that moved between two states. Each state had its own behaviour.

In the `ObservingState`, fatigue accumulated.

```python
consciousness.fatigue += 0.5
```

In the `ExistingState`, fatigue decreased.

```python
consciousness.fatigue = max(0, consciousness.fatigue - 5.0)
```

The numbers were not measurements of anything. They were values chosen to make the program behave in a way that resembled my description.

I also wanted to represent something that happened when contemplation became difficult to escape.

The program called it a `meta-cognition loop`.

```python
messages = [
    "  ... Does the 'desk' exist?",
    "  ... What does it mean 'to see'?",
    "  ... Can 'existence' be asserted?",
    "  ... Even 'cannot assert' cannot be asserted.",
    "  ... [Perceptual loop. Fatigue rising rapidly]"
]
```

The questions repeated, and fatigue accumulated more quickly.

The program included two ways to interrupt the loop. One was a physical gesture: touching my left chest with my right hand. The other was making a minimal statement about something perceived, such as *A humidifier casts a shadow.*

There was also a threshold at which accumulated fatigue caused a transition to the `ExistingState`. Once there, the program reduced fatigue for a short time before returning to the `ObservingState`.

I did not think that a few classes, variables, and random events could reproduce consciousness. I tried to approximate something about how I experienced it.

The program gave those experiences names and rules. It distinguished observation from existence, assigned different consequences to each, and defined the conditions under which one could become the other.

Recently, I came across the code again. I noticed that the description of `ExistingState` still contained the words *three or four times a year*. That was how rarely I thought I experienced it when I first described the model.

It is different now.

I experience what I would call the `ExistingState` more frequently. But I do not think the difference is simply a matter of frequency. Some situations I would previously have classified as `ObservingState` now seem closer to `ExistingState`.

The program still distinguishes the two states. The `ObservingState` accumulates fatigue, and the `ExistingState` reduces it. The transitions follow the rules written into the code.

I can still recognize the experiences I was trying to describe.

But I no longer draw the line between those two states in the same place.
