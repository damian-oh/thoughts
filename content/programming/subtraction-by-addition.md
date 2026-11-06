---
title: Subtraction by Addition
tags:
  - representation
  - binary
  - design
aliases:
  - /subtraction-by-addition
---

When I first learned how a computer handles negative numbers and subtraction, I found the mechanism unexpectedly compelling.

At the hardware level, building a circuit that adds two binary numbers is relatively straightforward. Implementing subtraction as a separate operation, however, introduces additional complexity.

Early computer architects faced an obvious question: how should negative numbers be represented in binary so that the hardware remains as simple as possible?

The most intuitive approach is called sign-and-magnitude. In a four-bit system, if the first bit represents the sign ($0$ for positive, $1$ for negative) and the remaining three bits represent the value, then $+3$ is $0011$ and $-3$ is $1011$.

For a human reader, this is clean and explicit. For an adder circuit, however, it fails.

If you pass $5$ ($0101$) and $-3$ ($1011$) into an ordinary binary adder, the circuit simply adds the bits together and produces $0000$ with a carry-out of $1$. Interpreted as sign-and-magnitude, the four-bit result is $+0$, not the expected $+2$. Worse, the system now has two different representations for zero ($0000$ and $1000$), and the hardware must inspect the signs and magnitudes before deciding whether to add or subtract.

There is a slightly different approach. Ones' complement is a binary numeral system where the negative form of an $n$-bit integer is obtained by subtracting the absolute value of the integer from $2^n - 1 = \underbrace{11\dots1}_{n\text{ ones}}{}_2$.

In a four-bit system, $+3$ is represented as $0011$. To represent $-3$ using ones' complement:

```
   1111 (2⁴ - 1 = 15)
-  0011 (3, the absolute value of -3)
-------
   1100
```

Or in practice, you invert every bit to form a negative number, turning $+3$ ($0011$) into $-3$ ($1100$). This brings the arithmetic closer to working, but it still leaves two zeros ($0000$ and $1111$) and requires an extra step, an operation called "end-around carry," where any overflow bit must be wrapped around and added back to the lowest bit.

End-around carry is an additional requirement imposed by the representation.

In ones' complement, the bit pattern representing a negative integer $-x$ has the unsigned value $(2^n - 1) - x$, where $x > 0$.

$\operatorname{onesComplement}(x) = 2^n - 1 - x$

Then, $y + \operatorname{onesComplement}(x) = y + (2^n - 1 - x) = 2^n + (y - x) -1$ (where $x$ and $y$ are integers and $y > x > 0$).

Here, $2^n$ represents a carry-out beyond the $n$-th bit, and interestingly, discarding that $2^n$ leaves $(y - x) - 1$, which is off by exactly 1.

Adding that discarded $2^n$ carry back into the lowest position addresses the issue:

$(y - x) - 1 + 1 = y - x$

There is a reason for that missing one.

In ones' complement, zero has two distinct representations: positive zero ($+0$), which is $0000$ and negative zero ($-0$), which is $1111$.

Consider the four-bit patterns for the values around zero, arranged in unsigned binary order:

```
Value       Bit Pattern (4-bit)
-------------------------------
-1          1110
-0          1111
+0          0000
+1          0001
```

The extra representation of zero reveals something important about ones' complement. Its arithmetic effectively wraps around modulo $2^n - 1$ rather than modulo $2^n$. When an addition produces a carry beyond the fixed bit width, simply discarding it would mean dropping $2^n$, which is equivalent to $+1$ modulo $2^n - 1$.

In other words, when subtracting a smaller positive integer from a larger one using ones' complement, discarding the carry-out leaves a result that is one too small. The end-around carry corrects this by adding the discarded bit back to the least significant bit.

However, when subtracting a larger positive integer from a smaller one using ones' complement, no end-around carry occurs.

$y + \operatorname{onesComplement}(x) = y + (2^n - 1 - x) = 2^n + (y - x) - 1 = 2^n - 1 - (x - y)$ (where $x$ and $y$ are integers and $x > y > 0$).

An end-around carry occurs $\iff$ the result generates an overflow out of the $n$-th bit, meaning: $\text{Result} \geq 2^n$.

Because $x > y$ and both are integers, $x - y \geq 1$.

So $2^n - 1 - (x - y) \leq 2^n - 2 < 2^n$.

Since the result is strictly smaller than $2^n$, no carry-out of the most significant bit is ever produced.

When $x = y$, no carry-out occurs, and the result is $2^n - 1$, which is negative zero ($1111$ in a four-bit system).

What modern computers actually use is two's complement. Two's complement is a representation of signed integers where the negative of an $n$-bit integer is represented by subtracting the absolute value of the integer from $2^n = 1\underbrace{00\dots0}_{n\text{ zeros}}{}_2$.

In a four-bit system, $+3$ is represented as $0011$. To represent $-3$ using two's complement:

```
   10000 (2⁴ = 16)
-   0011 (3, the absolute value of -3)
--------
    1101
```

Or in practice, you invert all the bits and add $1$. In a four-bit system, $+3$ is $0011$. Inverting the bits gives $1100$, and adding $1$ gives $1101$.

At first glance, $1101$ looks like an arbitrary way to write $-3$. Looking at the bits alone, the symmetry of sign-and-magnitude is gone.

What replaces it is structural convenience.

In a four-bit two's complement system, the leftmost bit acts as a negative weight ($-2^3$, or $-8$), while the remaining bits remain positive ($+4$, $+2$, $+1$). So $1101$ is not "a negative sign followed by 5." It is $-8 + 4 + 0 + 1$, which equals $-3$.

Zero now has only one representation: $0000$. If you invert it ($1111$) and add $1$, you get $10000$. In a four-bit register, the fifth bit overflows and is discarded, leaving $0000$ again.

The real advantage appears when the computer needs to subtract. Instead of subtracting $3$ from $5$, the computer adds $-3$ to $5$:

```
  0101 (5)
+ 1101 (-3)
------
 10010
```

Because the register only holds four bits, the leading $1$ overflows the four-bit boundary and is simply dropped.

What remains in the register is $0010$, which is $2$.

The adder did not need to know that it was subtracting. It did not need to compare the magnitudes or treat negative operands differently. It simply performed the same binary addition, discarded the carry beyond the fixed bit width, and produced the correct result.

What I found compelling was the practicality of that decision.

The system was designed by humans, but its internal representation did not need to follow human intuition. Sign-and-magnitude would have made negative numbers easier to read, but that was not what the hardware needed. Two's complement gave up that human-friendly representation in exchange for simpler arithmetic.

After all, I do not need a computer to represent negative numbers in a way that makes immediate sense to me. I need the result to be correct.
