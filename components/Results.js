"use client";
import Image from "next/image";

import { useState } from "react";
import Modal from "@/components/Modal";

import netflix_interview from '@/app/assets/netflix-interview.png';
import zapier_offer from '@/app/assets/zapier-offer1.png';
import gusto from '@/app/assets/gusto-interview.png';
import rippling from '@/app/assets/rippling-interview.png';
import openai from '@/app/assets/openai-interview.png';
import vannevar from '@/app/assets/vanevar-offer.png';
import meta from '@/app/assets/meta-interview.png';

const invites = [
{
    company: "OpenAI",
    role: "AI Engineer",
    img: openai,
    alt: "OpenAI interview invitation email"},

  {
    company: "Netflix",
    role: "Software Engineer",
    img: netflix_interview,
    alt: "Netflix interview invitation email"
  },
  {
    company: "Zapier",
    role: "Sr Software Engineer",
    img: zapier_offer,
    alt: "Zapier offer letter"
  },
  {
    company: "Meta",
    role: "Principal Engineer",
    img: meta,
    alt: "Meta Interview email"
  },
  {
    company: "Gusto",
    role: "Sr Software Engineer",
    img: gusto,
    alt: "Gusto interview invitation email"
  },
  {
    company: "Vannevar",
    role: "Sr Software Engineer",
    img: vannevar,
    alt: "Vannevar Labs offer email"
  },
  {
    company: "Rippling",
    role: "Sr Software Engineer",
    img: rippling,
    alt: "Rippling interview invitation email"
  }

];

const Results = () => {
    
const [selectedImage, setSelectedImage] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);

  return (

    <section className="overflow-hidden" id="results">

        <div className="flex flex-col text-center w-full mb-6">
            <p className="font-medium text-primary mb-2">Results</p>
        </div>

        <h2 className="max-w-3xl mx-auto text-center font-extrabold text-4xl md:text-5xl tracking-tight mb-6 md:mb-8">
          Get Results Fast!
        </h2>
    
        <div className="max-w-4xl mx-auto text-lg opacity-90 leading-relaxed mb-12 md:mb-20 px-6">
          <p className="mb-6">
            I had been firing off countless resumes into the black hole of online applications, only to hear crickets.
            So when I saw a role at OpenAI that was practically tailor-made for my skill set, I knew I needed a different approach.
          </p>
          
          <p className="mb-6">
            I built Magic Resume as a tool to help me scan job descriptions for top keywords. Then help me quickly
            fine-tune my resume with that language. Not spamming—just making sure I was speaking the same
            language as the automated filters and recruiters. The analysis gave me ideas to tweak a few bullet points to
            make it more relevant. I crossed my fingers and sent it off.
          </p>
          
          <p className="mb-6">
            A few days later, I got an email from a recruiter wanting to set up an interview.
             I tried a couple more times and it kept working. I was shocked.
            The takeaway here is pretty straightforward: If you want your resume to shine, you have to align it with the job description.
          </p>
          <p>It&apos;s not glamorous, but it works.</p>
        </div>

      <div className="max-w-6xl mx-auto px-8">
        {/* ... header content ... */}

        <div className="flex snap-x snap-mandatory overflow-x-auto gap-6 pb-6">
          {invites.map((invite, index) => (
            <div 
              key={index}
              className="flex-none w-[85%] md:w-[45%] snap-center"
            >
              <div className="bg-base-100 rounded-xl p-6 cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                    setSelectedImage(invite);
                    setIsModalOpen(true);
                    }}
              >
                <div className="aspect-[16/9] relative shadow-lg rounded-lg overflow-hidden mb-3">
                  <Image
                    src={invite.img}
                    alt={invite.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 85vw, 45vw"
                    priority
                  />
                </div>
                <h3 className="font-bold text-xl">{invite.company}</h3>
                <p className="text-base-content/70">{invite.role}</p>
              </div>
            </div>
          ))}
        </div>

        <Modal 
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}>
          {selectedImage && (
            <div className="w-full">
              <div className="aspect-[16/9] relative w-full rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.img}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  priority
                />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-xl">{selectedImage.company}</h3>
                <p className="text-base-content/70">{selectedImage.role}</p>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </section>
  );
};

export default Results;