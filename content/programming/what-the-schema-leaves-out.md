---
title: What the Schema Leaves Out
tags:
  - modelling
  - representation
  - interpretation
aliases:
  - /what-the-schema-leaves-out
---

I was building [Lydian Gravity](https://lydiangravity.damianoh.com/), a program to help songwriters sketch songs.

The program needed to store information about a song: its tonal centre, mode, tempo, sections, chord progressions, and melodies. I had to decide how to represent those things in a database.

At first, I considered storing chord progressions as JSON. A progression could be represented as a sequence of objects, each containing information about a chord.

Instead, I created a separate table for chords. Each chord became an individual record, linked to a section of a song. I could store its root, quality, position, duration, and other properties. The program could then work with each chord as a separate entity.

JSON could have represented much of the same information. The decision was not about one format being more capable of describing music. I chose a structure that suited the operations I wanted the program to perform.

But deciding how to store the chords was not the only problem. I also wanted the program to identify modal interchange.

In music theory, modal interchange is commonly described as borrowing chords from a parallel mode. For example, a song in C Lydian might use an F major chord associated with C Ionian.

I had already spent time questioning [[Triple Function|how harmonic analysis is justified]]. I was not entirely convinced by the theoretical basis of modal interchange itself.

However, I needed the program to do something. I decided to give each song a `master_mode` and each chord a `parent_mode`. The rule was simple. If a chord's `parent_mode` differed from the song's `master_mode`, the program would identify it as modal interchange. For a song in C Lydian, an F major chord assigned to Ionian would therefore be identified as borrowed.

The program could make that comparison without difficulty. But what exactly had it established?

The `parent_mode` was a value I had assigned to the chord. It was not something the database had discovered independently. A chord could be compatible with more than one mode, and assigning it to one did not necessarily rule out the others. The program was not determining whether my harmonic interpretation was justified. It was comparing two stored values and returning a result according to a rule I had written.

I could have designed a more elaborate system. I could have allowed multiple possible parent modes, introduced additional conditions, or represented uncertainty explicitly.

But those choices would have required further decisions about what the program should recognize and how it should evaluate the possibilities. I was building a tool for sketching songs, not a system intended to settle disagreements in harmonic analysis. So I [[Firmness Without Finality|kept the rule simple]].

There was nothing unusual about that decision. Programs need defined behaviour, and databases need defined structures. I could not leave every question unresolved and still expect the program to perform the operations I wanted.

Yet I found the distinction worth considering.

The database contained information about chords, but it did not contain every possible interpretation of them. More importantly, some of what it contained was already an interpretation.

A value such as `parent_mode` looked like an ordinary property of a chord. In the program, it was treated much like its position in a sequence. But assigning a mode to a chord involved a different kind of judgement.

Once I had stored the value, the program could use it consistently. That consistency did not establish the correctness of the interpretation. Nor did it make the schema useless.

I had decided how the program would recognize modal interchange.

I had not established what made that recognition correct.
